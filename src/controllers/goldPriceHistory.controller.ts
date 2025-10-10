import { Request, Response } from 'express';
import {
  getGoldPriceHistory,
  seedHistoricalPrices,
  storeTodayGoldPrice,
} from '../services/goldPriceService';

/**
 * Get historical gold prices
 */
export const getGoldPriceHistoryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate, days, limit } = req.query;

    let start: Date;
    let end: Date = new Date();
    end.setUTCHours(23, 59, 59, 999); // End of today

    if (startDate && endDate) {
      // Use provided date range
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    } else if (days) {
      // Use days parameter (e.g., last 30 days)
      const numDays = parseInt(days as string, 10);
      start = new Date();
      start.setDate(start.getDate() - numDays);
      start.setUTCHours(0, 0, 0, 0);
    } else {
      // Default to last 30 days
      start = new Date();
      start.setDate(start.getDate() - 30);
      start.setUTCHours(0, 0, 0, 0);
    }

    const maxLimit = limit ? parseInt(limit as string, 10) : 365;

    const history = await getGoldPriceHistory(start, end, maxLimit);

    res.status(200).json({
      history,
      count: history.length,
      startDate: start,
      endDate: end,
    });
  } catch (error: any) {
    console.error('GetGoldPriceHistory error:', error);
    res.status(500).json({ error: 'Failed to fetch gold price history' });
  }
};

/**
 * Manually trigger storing today's gold price
 * (Admin/testing endpoint)
 */
export const storeTodayPriceController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    await storeTodayGoldPrice();
    res.status(200).json({ message: 'Gold price stored successfully' });
  } catch (error: any) {
    console.error('StoreTodayPrice error:', error);
    res.status(500).json({ error: 'Failed to store gold price' });
  }
};

/**
 * Seed historical data (Admin/testing endpoint)
 */
export const seedHistoricalPricesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { days } = req.query;
    const numDays = days ? parseInt(days as string, 10) : 30;

    await seedHistoricalPrices(numDays);

    res.status(200).json({
      message: `Seeded ${numDays} days of historical gold prices`,
    });
  } catch (error: any) {
    console.error('SeedHistoricalPrices error:', error);
    res.status(500).json({ error: 'Failed to seed historical prices' });
  }
};
