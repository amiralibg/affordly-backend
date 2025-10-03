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
 *         - monthlySavings
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
 *           description: Product price
 *         monthlySavings:
 *           type: number
 *           description: Monthly savings amount
 *         isWishlisted:
 *           type: boolean
 *           description: Whether the product is in wishlist
 *         savedAmount:
 *           type: number
 *           description: Amount saved so far
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Product creation timestamp
 */
export interface IProduct extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  monthlySavings: number;
  isWishlisted: boolean;
  savedAmount: number;
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
    monthlySavings: {
      type: Number,
      required: true,
      min: 0,
    },
    isWishlisted: {
      type: Boolean,
      default: false,
    },
    savedAmount: {
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
