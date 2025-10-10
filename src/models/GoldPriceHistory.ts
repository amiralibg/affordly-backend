import mongoose, { Document, Schema } from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     GoldPriceHistory:
 *       type: object
 *       required:
 *         - price
 *         - date
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the price record
 *         price:
 *           type: number
 *           description: Gold price per gram (18K) in Toman
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the price (YYYY-MM-DD)
 *         source:
 *           type: string
 *           description: Source of the price data
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Record creation timestamp
 */
export interface IGoldPriceHistory extends Document {
  price: number; // Price per gram of 18K gold in Toman
  date: Date; // Date of the price (stored as start of day UTC)
  source?: string; // Source of the price (e.g., 'tgju.org', 'manual')
  createdAt: Date;
  updatedAt: Date;
}

const GoldPriceHistorySchema: Schema = new Schema(
  {
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
    },
    source: {
      type: String,
      default: 'tgju.org',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique price per date (no duplicate entries for same day)
GoldPriceHistorySchema.index({ date: 1 }, { unique: true });

// Index for efficient date range queries
GoldPriceHistorySchema.index({ date: -1 });

export default mongoose.model<IGoldPriceHistory>(
  'GoldPriceHistory',
  GoldPriceHistorySchema
);
