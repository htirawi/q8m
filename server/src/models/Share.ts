import mongoose, { type Document, Schema } from 'mongoose';

export interface IShare extends Document {
  userId: mongoose.Types.ObjectId;
  shareType: 'quiz_result' | 'achievement' | 'streak' | 'challenge_victory' | 'profile' | 'badge';
  entityId: mongoose.Types.ObjectId; // ID of the shared entity
  platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'email' | 'copy_link';
  metadata: {
    title?: string;
    description?: string;
    imageUrl?: string;
    score?: number;
    framework?: string;
    difficulty?: string;
    streakDays?: number;
    badgeName?: string;
    [key: string]: unknown;
  };
  clicks: number;
  createdAt: Date;
}

const ShareSchema = new Schema<IShare>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    shareType: {
      type: String,
      enum: ['quiz_result', 'achievement', 'streak', 'challenge_victory', 'profile', 'badge'],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    platform: {
      type: String,
      enum: ['twitter', 'facebook', 'linkedin', 'whatsapp', 'email', 'copy_link'],
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for analytics queries
ShareSchema.index({ userId: 1, shareType: 1, createdAt: -1 });
ShareSchema.index({ shareType: 1, platform: 1, createdAt: -1 });

export const Share = mongoose.model<IShare>('Share', ShareSchema);
