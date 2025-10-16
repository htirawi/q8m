import mongoose, { Schema, type Document, type ObjectId } from 'mongoose';

export interface INotificationPreferences extends Document {
  userId: ObjectId;
  enabled: boolean;
  types: {
    streak: boolean;
    content: boolean;
    challenges: boolean;
    achievements: boolean;
    subscription: boolean;
  };
  frequency: 'realtime' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string; // Format: "HH:MM"
    end: string; // Format: "HH:MM"
    timezone: string; // IANA timezone (e.g., "America/New_York")
  };
  createdAt: Date;
  updatedAt: Date;
}

const notificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    types: {
      streak: {
        type: Boolean,
        default: true,
      },
      content: {
        type: Boolean,
        default: true,
      },
      challenges: {
        type: Boolean,
        default: true,
      },
      achievements: {
        type: Boolean,
        default: true,
      },
      subscription: {
        type: Boolean,
        default: true,
      },
    },
    frequency: {
      type: String,
      enum: ['realtime', 'daily', 'weekly'],
      default: 'realtime',
    },
    quietHours: {
      enabled: {
        type: Boolean,
        default: false,
      },
      start: {
        type: String,
        default: '22:00',
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM format'],
      },
      end: {
        type: String,
        default: '08:00',
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:MM format'],
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = (ret._id as ObjectId).toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for performance
notificationPreferencesSchema.index({ userId: 1 }, { unique: true, name: 'uniq_user_id' });
notificationPreferencesSchema.index({ enabled: 1 }, { name: 'idx_enabled' });

export const NotificationPreferences = mongoose.model<INotificationPreferences>(
  'NotificationPreferences',
  notificationPreferencesSchema
);
