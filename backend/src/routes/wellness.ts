import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { processWellnessData } from '../services/aiProcessor.js';

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/wellness/scores
// @desc    Get user's wellness scores
// @access  Private
router.get('/scores', authenticate, async (req, res, next) => {
  try {
    const {
      scoreType,
      startDate,
      endDate,
      limit = '50'
    } = req.query;

    const where: any = { userId: req.user!.id };

    if (scoreType) {
      where.scoreType = scoreType;
    }

    if (startDate || endDate) {
      where.periodEnd = {};
      if (startDate) where.periodEnd.gte = new Date(startDate as string);
      if (endDate) where.periodEnd.lte = new Date(endDate as string);
    }

    const scores = await prisma.wellnessScore.findMany({
      where,
      orderBy: { periodEnd: 'desc' },
      take: parseInt(limit as string),
      select: {
        id: true,
        scoreType: true,
        score: true,
        confidence: true,
        periodStart: true,
        periodEnd: true,
        factors: true,
        explanation: true,
        createdAt: true
      }
    });


    res.json({
      success: true,
      data: { scores }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/wellness/scores/latest
// @desc    Get latest wellness scores for all categories
// @access  Private
router.get('/scores/latest', authenticate, async (req, res, next) => {
  try {
    const scoreTypes = ['overall', 'stress', 'sleep', 'energy', 'recovery', 'focus', 'mood'];

    const latestScores = await Promise.all(
      scoreTypes.map(async (scoreType) => {
        const score = await prisma.wellnessScore.findFirst({
          where: {
            userId: req.user!.id,
            scoreType
          },
          orderBy: { periodEnd: 'desc' },
          select: {
            scoreType: true,
            score: true,
            confidence: true,
            periodStart: true,
            periodEnd: true,
            factors: true,
            explanation: true
          }
        });
        return score;
      })
    );

    // Filter out null scores and organize by type
    const scores = latestScores
      .filter(score => score !== null)
      .reduce((acc, score) => {
        acc[score!.scoreType] = score;
        return acc;
      }, {} as Record<string, any>);

    res.json({
      success: true,
      data: { scores }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/wellness/scores/process
// @desc    Trigger AI processing to generate new wellness scores
// @access  Private
router.post('/scores/process', authenticate, async (req, res, next) => {
  try {
    // Get recent wearable data for processing
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const wearableData = await prisma.wearableData.findMany({
      where: {
        userId: req.user!.id,
        timestamp: {
          gte: sevenDaysAgo
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 1000 // Limit for processing
    });

    if (wearableData.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No recent wearable data found. Please sync your devices first.'
      });
    }

    // Process data with AI
    const wellnessScores = await processWellnessData(req.user!.id, wearableData);

    res.json({
      success: true,
      data: {
        scores: wellnessScores,
        processedDataPoints: wearableData.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/wellness/insights
// @desc    Get user's wellness insights
// @access  Private
router.get('/insights', authenticate, async (req, res, next) => {
  try {
    const {
      category,
      status = 'active',
      limit = '20'
    } = req.query;

    const where: any = {
      userId: req.user!.id,
      status: status as string
    };

    if (category) {
      where.category = category;
    }

    const insights = await prisma.insight.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: parseInt(limit as string),
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        severity: true,
        priority: true,
        recommendations: true,
        practiceIds: true,
        status: true,
        expiresAt: true,
        createdAt: true
      }
    });


    res.json({
      success: true,
      data: { insights }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/wellness/insights/:id/status
// @desc    Update insight status (dismiss/act upon)
// @access  Private
router.put('/insights/:id/status', authenticate, async (req, res, next) => {
  try {
    const insightId = req.params.id;
    const { status, action } = req.body;

    // Verify insight belongs to user
    const insight = await prisma.insight.findFirst({
      where: {
        id: insightId,
        userId: req.user!.id
      }
    });

    if (!insight) {
      return res.status(404).json({
        success: false,
        error: 'Insight not found'
      });
    }

    // Update insight status
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'acted_upon') {
      updateData.actedAt = new Date();
    } else if (status === 'dismissed') {
      updateData.dismissedAt = new Date();
    }

    const updatedInsight = await prisma.insight.update({
      where: { id: insightId },
      data: updateData,
      select: {
        id: true,
        title: true,
        status: true,
        actedAt: true,
        dismissedAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: { insight: updatedInsight }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/wellness/dashboard
// @desc    Get comprehensive wellness dashboard data
// @access  Private
router.get('/dashboard', authenticate, async (req, res, next) => {
  try {
    // Get latest scores
    const scoreTypes = ['overall', 'stress', 'sleep', 'energy'];
    const latestScores = await Promise.all(
      scoreTypes.map(async (scoreType) => {
        const score = await prisma.wellnessScore.findFirst({
          where: {
            userId: req.user!.id,
            scoreType
          },
          orderBy: { periodEnd: 'desc' }
        });
        return score;
      })
    );

    // Get active insights (high priority first)
    const insights = await prisma.insight.findMany({
      where: {
        userId: req.user!.id,
        status: 'active'
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 5,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        severity: true,
        priority: true,
        recommendations: true
      }
    });

    // Get recent wearable data summary
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentDataSummary = await prisma.wearableData.groupBy({
      by: ['dataType'],
      where: {
        userId: req.user!.id,
        timestamp: {
          gte: oneDayAgo
        }
      },
      _count: {
        id: true
      }
    });

    // Get upcoming sessions
    const upcomingSessions = await prisma.session.findMany({
      where: {
        userId: req.user!.id,
        scheduledAt: {
          gte: new Date()
        },
        status: {
          in: ['scheduled', 'confirmed']
        }
      },
      orderBy: { scheduledAt: 'asc' },
      take: 3,
      include: {
        practitioner: {
          select: {
            firstName: true,
            lastName: true,
            specialties: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        scores: latestScores.filter(score => score !== null),
        insights,
        dataSummary: recentDataSummary,
        upcomingSessions
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;