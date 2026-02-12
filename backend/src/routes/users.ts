import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema for profile updates
const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  goals: z.array(z.string()).optional(),
  timezone: z.string().optional()
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
        height: true,
        weight: true,
        fitnessLevel: true,
        goals: true,
        timezone: true,
        createdAt: true,
        wearableConnections: {
          select: {
            provider: true,
            enabled: true,
            lastSync: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);

    const updateData: any = { ...validatedData };
    if (validatedData.dateOfBirth) {
      updateData.dateOfBirth = new Date(validatedData.dateOfBirth);
    }
    if (validatedData.goals) {
      updateData.goals = validatedData.goals;
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
        height: true,
        weight: true,
        fitnessLevel: true,
        goals: true,
        timezone: true,
        updatedAt: true
      }
    });

    if (user) {
      // Transform goals from string to array
      user.goals = user.goals ? user.goals.split(',') : [];
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    next(error);
  }
});

export default router;