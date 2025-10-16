import mongoose, { Schema, type Document, type ObjectId } from "mongoose";

export interface INotificationHistory extends Document {
  userId: ObjectId;
  type:
    | "streak_reminder"
    | "challenge"
    | "achievement"
    | "new_content"
    | "trial_ending"
    | "subscription";
  title: string;
  body: string;
  data?: Record<string, unknown>;
  status: "sent" | "failed" | "pending";
  sentAt?: Date;
  failureReason?: string;
  deviceTokensUsed: number;
  successCount: number;
  failureCount: number;
  clickedAt?: Date;
  clicked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationHistorySchema = new Schema<INotificationHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "streak_reminder",
        "challenge",
        "achievement",
        "new_content",
        "trial_ending",
        "subscription",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    body: {
      type: String,
      required: true,
      maxlength: [500, "Body cannot exceed 500 characters"],
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["sent", "failed", "pending"],
      default: "pending",
      required: true,
    },
    sentAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
    deviceTokensUsed: {
      type: Number,
      default: 0,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
    clickedAt: {
      type: Date,
    },
    clicked: {
      type: Boolean,
      default: false,
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
notificationHistorySchema.index({ userId: 1, createdAt: -1 }, { name: "idx_user_created" });
notificationHistorySchema.index({ type: 1 }, { name: "idx_type" });
notificationHistorySchema.index({ status: 1 }, { name: "idx_status" });
notificationHistorySchema.index({ sentAt: -1 }, { name: "idx_sent_at" });
notificationHistorySchema.index({ clicked: 1 }, { name: "idx_clicked" });
notificationHistorySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 7776000, name: "idx_ttl_90days" }
); // 90 days TTL

export const NotificationHistory = mongoose.model<INotificationHistory>(
  "NotificationHistory",
  notificationHistorySchema
);
