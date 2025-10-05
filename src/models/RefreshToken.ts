import mongoose, { Document, Schema } from 'mongoose';

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  platform: string; // 'ios' | 'android' | 'web'
  appVersion?: string;
  osVersion?: string;
}

export interface SecurityInfo {
  ipAddress?: string;
  userAgent?: string;
  lastUsedAt: Date;
  usageCount: number;
  suspiciousActivity: boolean;
}

export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date;
  isRevoked: boolean;
  deviceInfo: DeviceInfo;
  securityInfo: SecurityInfo;
  replacedByToken?: string; // For token rotation tracking
}

const RefreshTokenSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    deviceInfo: {
      deviceId: {
        type: String,
        required: true,
      },
      deviceName: {
        type: String,
        required: true,
      },
      platform: {
        type: String,
        required: true,
        enum: ['ios', 'android', 'web'],
      },
      appVersion: String,
      osVersion: String,
    },
    securityInfo: {
      ipAddress: String,
      userAgent: String,
      lastUsedAt: {
        type: Date,
        default: Date.now,
      },
      usageCount: {
        type: Number,
        default: 0,
      },
      suspiciousActivity: {
        type: Boolean,
        default: false,
      },
    },
    replacedByToken: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for automatic deletion of expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for efficient device queries
RefreshTokenSchema.index({ userId: 1, 'deviceInfo.deviceId': 1 });

export default mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
