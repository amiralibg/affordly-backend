import { Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import SavingsLog from '../models/SavingsLog';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

/**
 * Create a new savings log entry
 */
export const createSavingsLog = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.userId;
    const { amount, type, productId, note, date } = req.body;

    // Validate productId if provided
    if (productId) {
      const product = await Product.findOne({ _id: productId, userId });
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
    }

    const savingsLog = new SavingsLog({
      userId,
      amount,
      type: type || 'money',
      productId: productId || undefined,
      note: note || undefined,
      date: date ? new Date(date) : new Date(),
    });

    await savingsLog.save();

    res.status(201).json({
      message: 'Savings log created successfully',
      savingsLog,
    });
  } catch (error: any) {
    console.error('CreateSavingsLog error:', error);
    res.status(500).json({ error: 'Failed to create savings log' });
  }
};

/**
 * Get all savings logs for the authenticated user
 */
export const getSavingsLogs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const { startDate, endDate, type, productId, limit = 100 } = req.query;

    // Build query filter
    const filter: any = { userId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    if (type) {
      filter.type = type;
    }

    if (productId) {
      filter.productId = productId;
    }

    const savingsLogs = await SavingsLog.find(filter)
      .populate('productId', 'name price goldEquivalent')
      .sort({ date: -1 })
      .limit(Number(limit));

    res.status(200).json({ savingsLogs });
  } catch (error: any) {
    console.error('GetSavingsLogs error:', error);
    res.status(500).json({ error: 'Failed to fetch savings logs' });
  }
};

/**
 * Delete a savings log entry
 */
export const deleteSavingsLog = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const savingsLog = await SavingsLog.findOne({ _id: id, userId });

    if (!savingsLog) {
      res.status(404).json({ error: 'Savings log not found' });
      return;
    }

    await SavingsLog.deleteOne({ _id: id });

    res.status(200).json({ message: 'Savings log deleted successfully' });
  } catch (error: any) {
    console.error('DeleteSavingsLog error:', error);
    res.status(500).json({ error: 'Failed to delete savings log' });
  }
};

/**
 * Get analytics/aggregated data for savings logs
 */
export const getSavingsAnalytics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const { period = 'month', startDate, endDate } = req.query;

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);

    // Default to last 30 days if no dates provided
    if (!startDate && !endDate) {
      dateFilter.$gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Determine grouping format based on period
    let dateFormat: any;
    switch (period) {
      case 'day':
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
        break;
      case 'week':
        dateFormat = { $dateToString: { format: '%Y-W%V', date: '$date' } };
        break;
      case 'month':
      default:
        dateFormat = { $dateToString: { format: '%Y-%m', date: '$date' } };
        break;
    }

    // Aggregate savings by period
    const aggregation = await SavingsLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: dateFilter,
        },
      },
      {
        $group: {
          _id: {
            period: dateFormat,
            type: '$type',
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.period': 1 },
      },
    ]);

    // Calculate total savings
    const totals = await SavingsLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: dateFilter,
        },
      },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Format response
    const totalMoney =
      totals.find((t: any) => t._id === 'money')?.totalAmount || 0;
    const totalGold =
      totals.find((t: any) => t._id === 'gold')?.totalAmount || 0;
    const totalEntries = totals.reduce(
      (sum: number, t: any) => sum + t.count,
      0
    );

    res.status(200).json({
      analytics: {
        period,
        startDate: dateFilter.$gte,
        endDate: dateFilter.$lte || new Date(),
        totals: {
          money: totalMoney,
          gold: totalGold,
          entries: totalEntries,
        },
        byPeriod: aggregation,
      },
    });
  } catch (error: any) {
    console.error('GetSavingsAnalytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
