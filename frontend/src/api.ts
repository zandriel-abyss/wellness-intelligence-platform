const API_BASE = import.meta.env.VITE_API_URL || '';

function getToken(): string | null {
  return localStorage.getItem('wellness_token');
}

export async function register(email: string, password: string, firstName: string, lastName: string) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, firstName, lastName }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Registration failed');
  if (data.data?.token) localStorage.setItem('wellness_token', data.data.token);
  return data.data;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Login failed');
  if (data.data?.token) localStorage.setItem('wellness_token', data.data.token);
  return data.data;
}

export function logout() {
  localStorage.removeItem('wellness_token');
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

/** Build timestamps for the last N days (daysAgo 0 = today, 1 = yesterday, etc.) */
function timestampDaysAgo(daysAgo: number, hour: number = 8): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

/** Richer demo: ~24 data points over 5 days with variation (heartrate, sleep, activity, hrv, stress) */
export async function addDemoWearableData() {
  const token = getToken();
  if (!token) throw new Error('Not logged in');

  const points: { dataType: string; value: number; unit: string; timestamp: string }[] = [];
  for (let day = 0; day < 5; day++) {
    const ts = timestampDaysAgo(day);
    points.push({ dataType: 'heartrate', value: 68 + Math.round(Math.random() * 12), unit: 'bpm', timestamp: ts });
    points.push({ dataType: 'sleep', value: 5.5 + Math.random() * 2.5, unit: 'hours', timestamp: ts });
    points.push({ dataType: 'activity', value: 4000 + Math.round(Math.random() * 8000), unit: 'steps', timestamp: ts });
    points.push({ dataType: 'hrv', value: 35 + Math.round(Math.random() * 25), unit: 'ms', timestamp: ts });
    if (day < 3) points.push({ dataType: 'stress', value: 30 + Math.round(Math.random() * 45), unit: 'score', timestamp: ts });
  }

  for (const p of points) {
    const res = await fetch(`${API_BASE}/api/wearables/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        provider: 'demo',
        dataType: p.dataType,
        rawData: { source: 'demo', value: p.value },
        timestamp: p.timestamp,
        value: p.value,
        unit: p.unit,
        quality: 'high',
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to add data');
  }
}

export async function runWellnessAnalysis(): Promise<{
  scores: Array<{ scoreType?: string; type?: string; score: number; explanation?: string }>;
  insights: Array<{ title: string; description: string; recommendations?: string[] }>;
  processedDataPoints: number;
}> {
  const token = getToken();
  if (!token) throw new Error('Not logged in');
  const res = await fetch(`${API_BASE}/api/wellness/scores/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Analysis failed');
  const result = data.data;
  const scores = result.scores?.scores ?? result.scores ?? [];
  const insights = result.scores?.insights ?? result.insights ?? [];
  return {
    scores: Array.isArray(scores) ? scores : [],
    insights: Array.isArray(insights) ? insights : [],
    processedDataPoints: result.processedDataPoints ?? 0,
  };
}

export async function getMe(): Promise<{ id: string; email: string; firstName?: string; lastName?: string }> {
  const token = getToken();
  if (!token) throw new Error('Not logged in');
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to load profile');
  return data.data.user;
}

export async function getInsights(): Promise<Array<{ id: string; title: string; description: string; category: string; recommendations: string[] }>> {
  const token = getToken();
  if (!token) throw new Error('Not logged in');
  const res = await fetch(`${API_BASE}/api/wellness/insights`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to load insights');
  return data.data?.insights ?? [];
}

export async function getLatestScores(): Promise<Record<string, { score: number; explanation?: string }>> {
  const token = getToken();
  if (!token) throw new Error('Not logged in');
  const res = await fetch(`${API_BASE}/api/wellness/scores/latest`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to load scores');
  return data.data?.scores ?? {};
}
