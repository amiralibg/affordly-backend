import mongoose, { Document, Schema } from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Profile:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the profile
 *         userId:
 *           type: string
 *           description: The id of the user
 *         monthlySalary:
 *           type: number
 *           description: User's monthly salary
 *         currency:
 *           type: string
 *           description: Preferred currency
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Profile creation timestamp
 */
export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  monthlySalary: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    monthlySalary: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProfile>('Profile', ProfileSchema);
