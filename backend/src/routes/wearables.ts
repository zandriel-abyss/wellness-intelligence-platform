import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const connectWearableSchema = z.object({
  provider: z.enum(['fitbit', 'oura', 'apple_health', 'garmin', 'whoop', 'polar']),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  tokenExpiry: z.string().optional(),
  providerId: z.string().optional()
});

const wearableDataSchema = z.object({
  provider: z.string(),
  dataType: z.string(),
  rawData: z.record(z.any()),
  timestamp: z.string(),
  value: z.number().optional(),
  unit: z.string().optional(),
  quality: z.enum(['high', 'medium', 'low']).optional(),
  source: z.string().optional(),
  notes: z.string().optional()
});

// @route   POST /api/wearables/connect
// @desc    Connect a wearable device
// @access  Private
router.post('/connect', authenticate, async (req, res, next) => {
  try {
    const validatedData = connectWearableSchema.parse(req.body);

    // Check if connection already exists
    const existingConnection = await prisma.wearableConnection.findUnique({
      where: {
        userId_provider: {
          userId: req.user!.id,
          provider: validatedData.provider
        }
      }
    });

    if (existingConnection) {
      // Update existing connection
      const updatedConnection = await prisma.wearableConnection.update({
        where: { id: existingConnection.id },
        data: {
          accessToken: validatedData.accessToken,
          refreshToken: validatedData.refreshToken,
          tokenExpiry: validatedData.tokenExpiry ? new Date(validatedData.tokenExpiry) : undefined,
          providerId: validatedData.providerId,
          enabled: true,
          updatedAt: new Date()
        },
        select: {
          id: true,
          provider: true,
          providerId: true,
          enabled: true,
          lastSync: true,
          createdAt: true
        }
      });

      return res.json({
        success: true,
        data: { connection: updatedConnection }
      });
    }

    // Create new connection
    const connection = await prisma.wearableConnection.create({
      data: {
        userId: req.user!.id,
        provider: validatedData.provider,
        providerId: validatedData.providerId,
        accessToken: validatedData.accessToken,
        refreshToken: validatedData.refreshToken,
        tokenExpiry: validatedData.tokenExpiry ? new Date(validatedData.tokenExpiry) : undefined
      },
      select: {
        id: true,
        provider: true,
        providerId: true,
        enabled: true,
        lastSync: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      data: { connection }
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

// @route   GET /api/wearables/connections
// @desc    Get user's wearable connections
// @access  Private
router.get('/connections', authenticate, async (req, res, next) => {
  try {
    const connections = await prisma.wearableConnection.findMany({
      where: { userId: req.user!.id },
      select: {
        id: true,
        provider: true,
        providerId: true,
        enabled: true,
        syncFrequency: true,
        lastSync: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { connections }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/wearables/connections/:id
// @desc    Update wearable connection
// @access  Private
router.put('/connections/:id', authenticate, async (req, res, next) => {
  try {
    const connectionId = req.params.id;
    const updateData = req.body;

    // Verify connection belongs to user
    const connection = await prisma.wearableConnection.findFirst({
      where: {
        id: connectionId,
        userId: req.user!.id
      }
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: 'Wearable connection not found'
      });
    }

    // Update connection
    const updatedConnection = await prisma.wearableConnection.update({
      where: { id: connectionId },
      data: {
        enabled: updateData.enabled,
        syncFrequency: updateData.syncFrequency,
        updatedAt: new Date()
      },
      select: {
        id: true,
        provider: true,
        enabled: true,
        syncFrequency: true,
        lastSync: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: { connection: updatedConnection }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/wearables/connections/:id
// @desc    Disconnect wearable
// @access  Private
router.delete('/connections/:id', authenticate, async (req, res, next) => {
  try {
    const connectionId = req.params.id;

    // Verify connection belongs to user
    const connection = await prisma.wearableConnection.findFirst({
      where: {
        id: connectionId,
        userId: req.user!.id
      }
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: 'Wearable connection not found'
      });
    }

    // Delete connection
    await prisma.wearableConnection.delete({
      where: { id: connectionId }
    });

    res.json({
      success: true,
      message: 'Wearable connection removed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/wearables/data
// @desc    Ingest wearable data
// @access  Private
router.post('/data', authenticate, async (req, res, next) => {
  try {
    const validatedData = wearableDataSchema.parse(req.body);

    // Create wearable data record
    const wearableData = await prisma.wearableData.create({
      data: {
        userId: req.user!.id,
        provider: validatedData.provider,
        dataType: validatedData.dataType,
        rawData: validatedData.rawData,
        timestamp: new Date(validatedData.timestamp),
        value: validatedData.value,
        unit: validatedData.unit,
        quality: validatedData.quality,
        source: validatedData.source,
        notes: validatedData.notes
      }
    });

    res.status(201).json({
      success: true,
      data: { wearableData }
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

// @route   GET /api/wearables/data
// @desc    Get user's wearable data
// @access  Private
router.get('/data', authenticate, async (req, res, next) => {
  try {
    const {
      dataType,
      startDate,
      endDate,
      limit = '100',
      offset = '0'
    } = req.query;

    const where: any = { userId: req.user!.id };

    if (dataType) {
      where.dataType = dataType;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }

    const wearableData = await prisma.wearableData.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      select: {
        id: true,
        provider: true,
        dataType: true,
        timestamp: true,
        value: true,
        unit: true,
        quality: true,
        source: true,
        createdAt: true
      }
    });

    // Transform rawData back to objects (though we're not returning it in select)

    const total = await prisma.wearableData.count({ where });

    res.json({
      success: true,
      data: {
        wearableData,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;