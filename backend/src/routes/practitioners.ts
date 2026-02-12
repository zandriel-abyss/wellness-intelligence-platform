import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/practitioners
// @desc    Get practitioners with optional filtering
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const {
      specialty,
      availability,
      rating,
      limit = '20'
    } = req.query;

    const where: any = { active: true };

    if (specialty) {
      where.specialties = {
        has: specialty as string
      };
    }

    if (rating) {
      where.rating = {
        gte: parseFloat(rating as string)
      };
    }

    const practitioners = await prisma.practitioner.findMany({
      where,
      orderBy: { rating: 'desc' },
      take: parseInt(limit as string),
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        specialties: true,
        certifications: true,
        experience: true,
        sessionTypes: true,
        pricing: true,
        rating: true,
        reviewCount: true,
        verified: true
      }
    });

    res.json({
      success: true,
      data: { practitioners }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/practitioners/:id
// @desc    Get practitioner details
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const practitioner = await prisma.practitioner.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        specialties: true,
        certifications: true,
        experience: true,
        sessionTypes: true,
        pricing: true,
        rating: true,
        reviewCount: true,
        verified: true,
        availability: true,
        timezone: true
      }
    });

    if (!practitioner) {
      return res.status(404).json({
        success: false,
        error: 'Practitioner not found'
      });
    }

    res.json({
      success: true,
      data: { practitioner }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/practitioners/:id/sessions
// @desc    Book a session with practitioner
// @access  Private
router.post('/:id/sessions', authenticate, async (req, res, next) => {
  try {
    const { sessionType, scheduledAt, duration, notes } = req.body;

    const practitioner = await prisma.practitioner.findUnique({
      where: { id: req.params.id }
    });

    if (!practitioner) {
      return res.status(404).json({
        success: false,
        error: 'Practitioner not found'
      });
    }

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: req.user!.id,
        practitionerId: req.params.id,
        sessionType,
        title: `${sessionType} with ${practitioner.firstName} ${practitioner.lastName}`,
        scheduledAt: new Date(scheduledAt),
        duration: duration || 60,
        notes
      },
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

    res.status(201).json({
      success: true,
      data: { session }
    });
  } catch (error) {
    next(error);
  }
});

export default router;