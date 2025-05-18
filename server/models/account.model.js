import { Schema, model } from "mongoose";

const accountSchema = new Schema(
    {
        account_name: {
            type: String,
            required: true,
            trim: true
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'Profile',
            required: true,
        },
        bank_id: {
            type: Schema.Types.ObjectId,
            ref: 'Bank',
            required: true,
        },
        account_type: {
            type: String,
            enum: ["savings", "current", "fixed"],
            default: "savings"
        },  
        balance: {
            type: Number,
            default: 0,
        },
        currency: {
            type: String,
            enum: ["INR", "USD"],
            default: "INR",
        },
        flagged: {
            status: {
                type: Boolean,
                default: false,
            },
            reason: {
                type: String,
                default: null,
                trim: true,
            },
            flagged_at: {
                type: Date,
                default: null
            }
        },
        deleted_at: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

accountSchema.index({ user_id: 1, deleted_at: 1 });


export const Account = model('Account', accountSchema);