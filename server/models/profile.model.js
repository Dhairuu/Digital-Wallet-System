import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const profileSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
            match: [/.+\@.+\..+/, 'Please fill a valid email address']
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            match: [/^\d{10}$/, 'Please fill a valid phone number']
        },
        password: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        pan_id: {
            type: String,
            required: true,
            match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number']
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        deleted_at: {
            type: Date,
            default: null
        },
        refreshToken: {
            type: String
        }
    },
    {timestamps: true}
);

profileSchema.index({
    phoneNumber: 1,
    deleted_at: 1
})

profileSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

//Custom Methods

profileSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

profileSchema.methods.generateRefreshToken = async function () {
    const refreshToken = jwt.sign({
        _id: this._id,
        role: this.role,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    )
    return refreshToken;
}

profileSchema.methods.generateAccessToken = async function () {
    const accessToken = jwt.sign({
        _id: this.id,
        role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    )
    return accessToken;
}

export const Profile = model('Profile', profileSchema);