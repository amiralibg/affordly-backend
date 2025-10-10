import express from 'express';
import {
  getGoldPriceHistoryController,
  storeTodayPriceController,
  seedHistoricalPricesController,
} from '../controllers/goldPriceHistory.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: GoldPriceHistory
 *   description: Historical gold price data and charts
 */

/**
 * @swagger
 * /api/gold-history:
 *   get:
 *     summary: Get historical gold prices
 *     tags: [GoldPriceHistory]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for price history
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for price history
 *       - in: query
 *         name: days
 *         schema:
 *           type: number
 *           default: 30
 *         description: Number of days of history to fetch (alternative to date range)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 365
 *         description: Maximum number of records to return
 *     responses:
 *       200:
 *         description: Historical gold price data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       price:
 *                         type: number
 *                 count:
 *                   type: number
 *                 startDate:
 *                   type: string
 *                   format: date
 *                 endDate:
 *                   type: string
 *                   format: date
 *       500:
 *         description: Server error
 */
router.get('/', getGoldPriceHistoryController);

/**
 * @swagger
 * /api/gold-history/store-today:
 *   post:
 *     summary: Manually store today's gold price
 *     tags: [GoldPriceHistory]
 *     description: Admin endpoint to manually trigger storing today's price
 *     responses:
 *       200:
 *         description: Price stored successfully
 *       500:
 *         description: Server error
 */
router.post('/store-today', storeTodayPriceController);

/**
 * @swagger
 * /api/gold-history/seed:
 *   post:
 *     summary: Seed historical price data
 *     tags: [GoldPriceHistory]
 *     description: Admin endpoint to seed historical data for testing
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: number
 *           default: 30
 *         description: Number of days to seed
 *     responses:
 *       200:
 *         description: Data seeded successfully
 *       500:
 *         description: Server error
 */
router.post('/seed', seedHistoricalPricesController);

export default router;
