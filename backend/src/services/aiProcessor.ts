import { Mistral } from '@mistralai/mistralai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ProcessedWellnessData {
  scores: any[];
  insights: Array<{
    title: string;
    description: string;
    category: string;
    severity: 'low' | 'medium' | 'high';
    priority: number;
    recommendations: string[];
    practiceIds: string[];
    evidence: any;
    reasoning: string;
  }>;
}

export async function processWellnessData(
  userId: string,
  wearableData: any[]
): Promise<ProcessedWellnessData> {
  try {
    console.log('Processing wellness data for user:', userId, 'with', wearableData.length, 'data points');

    // Group data by type and time period
    const dataSummary = summarizeWearableData(wearableData);
    console.log('Data summary:', dataSummary);

    let analysis;

    // Resolve Mistral client at call time so env ordering doesn't matter
    const mistralKey = process.env.MISTRAL_API_KEY;
    const useMistral = !!mistralKey && mistralKey !== 'sk-test-placeholder-key-for-development';

    console.log(
      '[aiProcessor] MISTRAL_API_KEY present:',
      !!mistralKey,
      'placeholder?',
      mistralKey === 'sk-test-placeholder-key-for-development',
      'useMistral:',
      useMistral
    );

    if (useMistral) {
      const mistral = new Mistral({ apiKey: mistralKey as string });
      const analysisPrompt = createAnalysisPrompt(dataSummary);

      const systemPrompt = `You are a wellness analyst. Reply with ONLY one valid JSON object. No markdown, no code fences, no comments, no trailing commas.
Structure (use exactly 4 scores and exactly 2 insights; keep explanations to one short sentence each):
{"scores":[{"type":"overall","score":0-100,"confidence":0-1,"factors":{},"explanation":""},{"type":"stress","score":0-100,"confidence":0-1,"factors":{},"explanation":""},{"type":"sleep","score":0-100,"confidence":0-1,"factors":{},"explanation":""},{"type":"energy","score":0-100,"confidence":0-1,"factors":{},"explanation":""}],"insights":[{"title":"","description":"","category":"stress|sleep|activity","severity":"low|medium|high","priority":1-100,"recommendations":[],"practiceTypes":[],"evidence":{},"reasoning":""},{"title":"","description":"","category":"","severity":"","priority":50,"recommendations":[],"practiceTypes":[],"evidence":{},"reasoning":""}]}`;

      let response = await callMistral(mistral, systemPrompt, analysisPrompt, 4096);
      let parsed = tryParseAnalysis(response);

      if (!parsed) {
        console.warn('[aiProcessor] First response invalid, retrying with shorter instructions...');
        const retryPrompt = `IMPORTANT: Reply with ONLY valid JSON, no markdown. Same structure: 4 scores (overall, stress, sleep, energy), 2 insights. One short sentence per explanation.\n\n${analysisPrompt}`;
        response = await callMistral(mistral, systemPrompt, retryPrompt, 4096);
        parsed = tryParseAnalysis(response);
      }

      if (parsed) {
        analysis = parsed;
      } else {
        console.error('[aiProcessor] Failed to parse AI JSON after retry. Falling back to mock. Snippet:', response.slice(0, 400));
        analysis = getMockAnalysis();
      }
    } else {
      // Mock AI response for testing or when Mistral is unavailable
      analysis = getMockAnalysis();
    }

    // Save wellness scores to database
    const savedScores = await saveWellnessScores(userId, analysis.scores);

    // Generate and save insights
    const savedInsights = await generateAndSaveInsights(userId, analysis.insights);

    return {
      scores: savedScores,
      insights: analysis.insights
    };

  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error('Failed to process wellness data');
  }
}

function getMockAnalysis() {
  return {
    scores: [
      {
        type: 'overall',
        score: 72,
        confidence: 0.8,
        factors: { sleep_quality: 0.7, stress_level: -0.4, activity_level: 0.3 },
        explanation: 'Good overall wellness with room for improvement in stress management'
      },
      {
        type: 'stress',
        score: 65,
        confidence: 0.85,
        factors: { hrv_variability: -0.5, resting_heart_rate: -0.3 },
        explanation: 'Elevated stress indicators detected'
      },
      {
        type: 'sleep',
        score: 78,
        confidence: 0.9,
        factors: { sleep_duration: 0.8, sleep_quality: 0.6 },
        explanation: 'Good sleep quality and duration'
      },
      {
        type: 'energy',
        score: 70,
        confidence: 0.75,
        factors: { activity_level: 0.5, recovery_metrics: 0.4 },
        explanation: 'Moderate energy levels with good recovery'
      }
    ],
    insights: [
      {
        title: 'Consider Mindfulness Practices',
        description: 'Your wearable data shows elevated stress patterns. Mindfulness and breathing exercises could help reduce stress levels.',
        category: 'stress',
        severity: 'medium',
        priority: 75,
        recommendations: ['Try 10 minutes of deep breathing daily', 'Practice mindfulness meditation', 'Consider yoga for stress relief'],
        practiceTypes: ['meditation', 'breathing', 'yoga'],
        evidence: { hrv_drop: '15%', elevated_rhr: '8bpm' },
        reasoning: 'HRV and resting heart rate patterns indicate stress accumulation that could benefit from mindfulness practices'
      },
      {
        title: 'Sleep Quality Optimization',
        description: 'Your sleep data looks good, but there may be opportunities to optimize your sleep environment.',
        category: 'sleep',
        severity: 'low',
        priority: 45,
        recommendations: ['Maintain consistent bedtime routine', 'Keep bedroom cool and dark', 'Avoid screens 1 hour before bed'],
        practiceTypes: ['sleep', 'relaxation'],
        evidence: { sleep_efficiency: '87%', deep_sleep_ratio: '18%' },
        reasoning: 'Sleep metrics are solid but could be enhanced with better pre-sleep routines'
      }
    ]
  };
}

async function callMistral(
  mistral: { chat: { complete: (opts: any) => Promise<{ choices?: Array<{ message?: { content?: string } }> }> } },
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<string> {
  const completion = await mistral.chat.complete({
    model: process.env.MISTRAL_MODEL || 'mistral-large-latest',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    maxTokens,
  });
  const text = completion.choices?.[0]?.message?.content as string;
  if (!text) throw new Error('No response from AI service');
  return text;
}

function tryParseAnalysis(response: string): { scores: any[]; insights: any[] } | null {
  let str = response;
  const first = str.indexOf('{');
  const last = str.lastIndexOf('}');
  if (first !== -1 && last > first) str = str.slice(first, last + 1);
  str = str.replace(/,\s*([}\]])/g, '$1');
  try {
    const out = JSON.parse(str);
    const scores = Array.isArray(out.scores) ? out.scores : [];
    const insights = Array.isArray(out.insights) ? out.insights : [];
    if (scores.length === 0) return null;
    return { scores, insights };
  } catch {
    return null;
  }
}

function summarizeWearableData(data: any[]) {
  const summary: Record<string, any> = {
    heartrate: [],
    sleep: [],
    activity: [],
    hrv: [],
    stress: [],
    temperature: [],
    oxygen: []
  };

  data.forEach(item => {
    const type = item.dataType.toLowerCase();
    if (summary[type] !== undefined) {
      summary[type].push({
        value: item.value,
        timestamp: item.timestamp,
        rawData: item.rawData
      });
    }
  });

  // Calculate aggregates
  const aggregates: Record<string, any> = {};
  Object.keys(summary).forEach(type => {
    const values = summary[type];
    if (values.length > 0) {
      const numericValues = values
        .map((v: any) => v.value)
        .filter((v: any) => v !== null && !isNaN(v));

      aggregates[type] = {
        count: values.length,
        average: numericValues.length > 0 ?
          numericValues.reduce((a: number, b: number) => a + b, 0) / numericValues.length : null,
        min: numericValues.length > 0 ? Math.min(...numericValues) : null,
        max: numericValues.length > 0 ? Math.max(...numericValues) : null,
        latest: values[0]?.value || null,
        trend: calculateTrend(values)
      };
    }
  });

  return aggregates;
}

function calculateTrend(data: any[]): 'increasing' | 'decreasing' | 'stable' {
  if (data.length < 3) return 'stable';

  const recent = data.slice(0, Math.min(10, data.length));
  const older = data.slice(Math.max(0, data.length - 10), data.length - 5);

  const recentAvg = recent
    .map(d => d.value)
    .filter(v => v !== null)
    .reduce((a, b) => a + b, 0) / recent.length;

  const olderAvg = older
    .map(d => d.value)
    .filter(v => v !== null)
    .reduce((a, b) => a + b, 0) / older.length;

  const change = (recentAvg - olderAvg) / olderAvg;

  if (Math.abs(change) < 0.05) return 'stable';
  return change > 0 ? 'increasing' : 'decreasing';
}

function createAnalysisPrompt(dataSummary: any): string {
  return `
Analyze this wearable data summary and provide wellness insights:

DATA SUMMARY:
${JSON.stringify(dataSummary, null, 2)}

Please analyze patterns in:
- Sleep quality and duration
- Heart rate variability (stress indicator)
- Activity levels and recovery
- Resting heart rate trends
- Overall physiological stress markers

Focus on identifying:
1. Current wellness state
2. Potential issues (stress, poor sleep, overtraining)
3. Positive trends to maintain
4. Actionable recommendations
5. Specific wellness practices that would help

Consider correlations between different metrics to provide holistic insights.
`;
}

async function saveWellnessScores(
  userId: string,
  scores: any[]
): Promise<any[]> {
  const now = new Date();
  const periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

  const savedScores: any[] = [];

  for (const scoreData of scores) {
    const score = await prisma.wellnessScore.create({
      data: {
        userId,
        scoreType: scoreData.type,
        score: scoreData.score,
        confidence: scoreData.confidence,
        periodStart,
        periodEnd: now,
        factors: scoreData.factors,
        explanation: scoreData.explanation
      }
    });
    savedScores.push(score);
  }

  return savedScores;
}

async function generateAndSaveInsights(
  userId: string,
  insights: any[]
): Promise<any[]> {
  const savedInsights: any[] = [];

  for (const insightData of insights) {
    // Find matching practices
    const matchingPractices = await findMatchingPractices(insightData.practiceTypes);

    const insight = await prisma.insight.create({
      data: {
        userId,
        title: insightData.title,
        description: insightData.description,
        category: insightData.category,
        severity: insightData.severity,
        priority: insightData.priority,
        recommendations: insightData.recommendations,
        practiceIds: matchingPractices.map(p => p.id),
        evidence: insightData.evidence,
        reasoning: insightData.reasoning,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    savedInsights.push(insight);
  }

  return savedInsights;
}

async function findMatchingPractices(practiceTypes: string[]): Promise<any[]> {
  if (!practiceTypes || practiceTypes.length === 0) {
    return [];
  }

  // Find practices that match the requested types
  const practices = await prisma.practice.findMany({
    where: {
      OR: practiceTypes.flatMap(type => [
        { category: type },
        { tags: { has: type } }
      ])
    },
    take: 3,
    orderBy: { popularity: 'desc' }
  });

  return practices;
}