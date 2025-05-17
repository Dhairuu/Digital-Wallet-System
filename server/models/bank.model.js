import { Schema, model } from 'mongoose';

const bankSchema = new Schema({
        bankName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        deleted_at: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
)

bankSchema.index({ bankName: 1, deleted_at: 1 });

export const Bank = model('Bank', bankSchema);