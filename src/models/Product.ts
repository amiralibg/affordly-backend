import mongoose, { Document, Schema } from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - userId
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the product
 *         userId:
 *           type: string
 *           description: The id of the user who owns this product
 *         name:
 *           type: string
 *           description: Product name
 *         price:
 *           type: number
 *           description: Product price in Toman
 *         goldEquivalent:
 *           type: number
 *           description: How many grams of 18K gold needed to buy this product
 *         goldPriceAtCreation:
 *           type: number
 *           description: Price of 18K gold per gram when product was added
 *         isWishlisted:
 *           type: boolean
 *           description: Whether the product is in wishlist
 *         savedGoldAmount:
 *           type: number
 *           description: Amount of gold (in grams) saved so far
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Product creation timestamp
 */
export interface IProduct extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  goldEquivalent: number;
  goldPriceAtCreation: number;
  isWishlisted: boolean;
  savedGoldAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    goldEquivalent: {
      type: Number,
      required: true,
      min: 0,
    },
    goldPriceAtCreation: {
      type: Number,
      required: true,
      min: 0,
    },
    isWishlisted: {
      type: Boolean,
      default: false,
    },
    savedGoldAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProduct>('Product', ProductSchema);
