/**
 * Simple demo: creates sample wearable data, runs the AI wellness analysis,
 * and prints scores + insights in plain language for a layman.
 *
 * Prerequisites:
 *   - Database running (e.g. docker compose up db -d)
 *   - backend/.env has DATABASE_URL and MISTRAL_API_KEY
 *
 * Run from project root:  cd backend && npm run demo
 * Or from backend:        npm run demo
 */

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { processWellnessData } from '../src/services/aiProcessor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@wellness-demo.local';
const DEMO_PASSWORD = 'DemoPass123!';

function now() {
  return new Date();
}

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function ensureDemoUser(): Promise<string> {
  const hashed = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    create: {
      email: DEMO_EMAIL,
      password: hashed,
      firstName: 'Demo',
      lastName: 'User',
      goals: ['better_sleep', 'stress_reduction'],
    },
    update: {},
    select: { id: true },
  });
  return user.id;
}

async function createSampleWearableData(userId: string): Promise<any[]> {
  const base = daysAgo(3);
  const types = [
    { dataType: 'heartrate', value: 72, unit: 'bpm' },
    { dataType: 'heartrate', value: 68, unit: 'bpm' },
    { dataType: 'heartrate', value: 75, unit: 'bpm' },
    { dataType: 'sleep', value: 6.5, unit: 'hours' },
    { dataType: 'sleep', value: 7.2, unit: 'hours' },
    { dataType: 'activity', value: 8500, unit: 'steps' },
    { dataType: 'activity', value: 6200, unit: 'steps' },
    { dataType: 'hrv', value: 45, unit: 'ms' },
    { dataType: 'hrv', value: 38, unit: 'ms' },
    { dataType: 'stress', value: 42, unit: 'score' },
  ];

  const created: any[] = [];
  for (let i = 0; i < types.length; i++) {
    const t = types[i];
    const timestamp = new Date(base.getTime() + i * 4 * 60 * 60 * 1000);
    const record = await prisma.wearableData.create({
      data: {
        userId,
        provider: 'demo',
        dataType: t.dataType,
        rawData: { source: 'demo', value: t.value },
        timestamp,
        value: t.value,
        unit: t.unit,
        quality: 'high',
        source: 'demo-script',
      },
    });
    created.push(record);
  }
  return created;
}

function printResult(result: { scores: any[]; insights: any[] }) {
  console.log('\n' + '='.repeat(60));
  console.log('  WELLNESS DEMO – Your AI-generated scores and insights');
  console.log('='.repeat(60) + '\n');

  console.log('📊 SCORES (0–100)\n');
  for (const s of result.scores) {
    const score = typeof s.score === 'number' ? s.score : s.score;
    const type = (s.scoreType || s.type || 'score').toUpperCase();
    const explanation = s.explanation || '—';
    console.log(`  ${type}: ${score}/100`);
    console.log(`     ${explanation}\n`);
  }

  console.log('💡 INSIGHTS\n');
  for (const i of result.insights) {
    const title = i.title || 'Insight';
    const description = i.description || '';
    const recs = Array.isArray(i.recommendations) ? i.recommendations : [];
    console.log(`  • ${title}`);
    console.log(`    ${description}`);
    if (recs.length) {
      console.log(`    Suggestions: ${recs.slice(0, 2).join('; ')}`);
    }
    console.log('');
  }
  console.log('='.repeat(60) + '\n');
}

async function main() {
  console.log('Wellness AI Demo – setting up…\n');

  const userId = await ensureDemoUser();
  console.log('✓ Demo user ready');

  const wearableData = await createSampleWearableData(userId);
  console.log(`✓ Created ${wearableData.length} sample wearable data points`);

  console.log('✓ Calling AI (Mistral) to analyze and generate scores & insights…\n');
  const result = await processWellnessData(userId, wearableData);

  printResult({ scores: result.scores, insights: result.insights });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Demo failed:', e.message);
  process.exit(1);
});
