import mongoose, { Schema, type Document, type ObjectId } from "mongoose";

export interface IDeviceToken {
  userId: ObjectId;
  token: string;
  platform: "web" | "ios" | "android";
  userAgent: string;
  lastUsed?: Date;
  isActive: boolean;
}

export type IDeviceTokenDoc = IDeviceToken & Document;

const deviceTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    platform: {
      type: String,
      enum: ["web", "ios", "android"],
      default: "web",
      required: true,
    },
    userAgent: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
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
deviceTokenSchema.index({ userId: 1, platform: 1 }, { name: "idx_user_platform" });
deviceTokenSchema.index({ token: 1 }, { unique: true, name: "uniq_token" });
deviceTokenSchema.index({ isActive: 1 }, { name: "idx_is_active" });
deviceTokenSchema.index({ lastUsed: -1 }, { name: "idx_last_used" });
deviceTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000, name: "idx_ttl_90days" }); // 90 days TTL

export const DeviceToken = mongoose.model<IDeviceToken>("DeviceToken", deviceTokenSchema);
