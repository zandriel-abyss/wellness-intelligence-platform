import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/practices
// @desc    Get wellness practices with optional filtering
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const {
      category,
      difficulty,
      tag,
      limit = '20'
    } = req.query;

    const where: any = {};

    if (category) {
      where.category = category as string;
    }

    if (difficulty) {
      where.difficulty = difficulty as string;
    }

    if (tag) {
      where.tags = {
        has: tag as string
      };
    }

    const practices = await prisma.practice.findMany({
      where,
      orderBy: { popularity: 'desc' },
      take: parseInt(limit as string),
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        duration: true,
        difficulty: true,
        tags: true,
        benefits: true,
        popularity: true,
        rating: true,
        reviewCount: true
      }
    });

    res.json({
      success: true,
      data: { practices }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/practices/:id
// @desc    Get practice details
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const practice = await prisma.practice.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        instructions: true,
        duration: true,
        difficulty: true,
        tags: true,
        benefits: true,
        image: true,
        video: true,
        audio: true,
        popularity: true,
        rating: true,
        reviewCount: true,
        aiCriteria: true
      }
    });

    if (!practice) {
      return res.status(404).json({
        success: false,
        error: 'Practice not found'
      });
    }

    // Increment popularity
    await prisma.practice.update({
      where: { id: req.params.id },
      data: { popularity: { increment: 1 } }
    });

    res.json({
      success: true,
      data: { practice }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/practices/recommended
// @desc    Get AI-recommended practices for user
// @access  Private
router.get('/recommended', authenticate, async (req, res, next) => {
  try {
    // Get user's active insights
    const insights = await prisma.insight.findMany({
      where: {
        userId: req.user!.id,
        status: 'active'
      },
      orderBy: { priority: 'desc' },
      take: 5
    });

    // Collect recommended practice IDs
    const recommendedPracticeIds = insights.flatMap((insight: any) => insight.practiceIds);

    if (recommendedPracticeIds.length === 0) {
      // Return popular practices as fallback
      const popularPractices = await prisma.practice.findMany({
        orderBy: { popularity: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          duration: true,
          difficulty: true,
          tags: true,
          benefits: true
        }
      });

      return res.json({
        success: true,
        data: { practices: popularPractices }
      });
    }

    // Get recommended practices
    const practices = await prisma.practice.findMany({
      where: {
        id: {
          in: recommendedPracticeIds
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        duration: true,
        difficulty: true,
        tags: true,
        benefits: true
      }
    });

    res.json({
      success: true,
      data: { practices }
    });
  } catch (error) {
    next(error);
  }
});

export default router;