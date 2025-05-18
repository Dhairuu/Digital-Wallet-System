import { Schema, model } from "mongoose";

const transactionSchema = new Schema(
  {
    account_id: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    transaction_type: {
      type: String,
      enum: ["deposit", "withdraw", "transfer"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
        type: String,
        enum: ["INR", "USD"],
        default: "INR",
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "success",
    },
    metadata: {
        type: Schema.Types.Mixed,
        default: null,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = model("Transaction", transactionSchema);
