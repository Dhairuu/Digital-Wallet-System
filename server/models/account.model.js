import { Schema, model } from "mongoose";

const accountSchema = new Schema(
    {
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
        amount: {
            type: Number,
            default: 0,
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