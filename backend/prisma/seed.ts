import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'DemoPass123!';

function daysAgo(days: number, hour = 8): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function main() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const active = await prisma.user.upsert({
    where: { email: 'demo-active@wellness-demo.local' },
    create: {
      email: 'demo-active@wellness-demo.local',
      password: hash,
      firstName: 'Active',
      lastName: 'Andy',
      goals: ['better_sleep', 'stress_reduction'],
    },
    update: {},
  });

  const restless = await prisma.user.upsert({
    where: { email: 'demo-restless@wellness-demo.local' },
    create: {
      email: 'demo-restless@wellness-demo.local',
      password: hash,
      firstName: 'Restless',
      lastName: 'Sam',
      goals: ['better_sleep', 'stress_reduction'],
    },
    update: {},
  });

  const activeData = [
    { dataType: 'heartrate', value: 62, unit: 'bpm' },
    { dataType: 'heartrate', value: 65, unit: 'bpm' },
    { dataType: 'sleep', value: 7.5, unit: 'hours' },
    { dataType: 'sleep', value: 8, unit: 'hours' },
    { dataType: 'activity', value: 12000, unit: 'steps' },
    { dataType: 'activity', value: 9500, unit: 'steps' },
    { dataType: 'hrv', value: 58, unit: 'ms' },
    { dataType: 'hrv', value: 55, unit: 'ms' },
    { dataType: 'stress', value: 28, unit: 'score' },
  ];

  const restlessData = [
    { dataType: 'heartrate', value: 78, unit: 'bpm' },
    { dataType: 'heartrate', value: 82, unit: 'bpm' },
    { dataType: 'sleep', value: 5, unit: 'hours' },
    { dataType: 'sleep', value: 5.5, unit: 'hours' },
    { dataType: 'activity', value: 3000, unit: 'steps' },
    { dataType: 'activity', value: 4500, unit: 'steps' },
    { dataType: 'hrv', value: 32, unit: 'ms' },
    { dataType: 'hrv', value: 28, unit: 'ms' },
    { dataType: 'stress', value: 65, unit: 'score' },
  ];

  for (let i = 0; i < activeData.length; i++) {
    const p = activeData[i];
    await prisma.wearableData.create({
      data: {
        userId: active.id,
        provider: 'seed',
        dataType: p.dataType,
        rawData: { source: 'seed', value: p.value },
        timestamp: daysAgo(i % 3),
        value: p.value,
        unit: p.unit,
        quality: 'high',
      },
    });
  }

  for (let i = 0; i < restlessData.length; i++) {
    const p = restlessData[i];
    await prisma.wearableData.create({
      data: {
        userId: restless.id,
        provider: 'seed',
        dataType: p.dataType,
        rawData: { source: 'seed', value: p.value },
        timestamp: daysAgo(i % 3),
        value: p.value,
        unit: p.unit,
        quality: 'high',
      },
    });
  }

  console.log('Seed done. Demo users (password: DemoPass123!):');
  console.log('  - demo-active@wellness-demo.local (Active Andy) – better sleep, more activity');
  console.log('  - demo-restless@wellness-demo.local (Restless Sam) – less sleep, higher stress');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
