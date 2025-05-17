import asyncHandler from '../Utils/asyncHandler.js';
import Profile from '../models/profile.model.js';
import ApiError from '../Utils/ApiError.js';
import ApiResponse from '../Utils/ApiResponse.js';

//Generaet Tokens
const generateTokens = async (user_id) {
    try {
        const user = await Profile.findById(user_id);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch(error) {
        throw new ApiError(500, "Token generation failed");
    }
}

//User Registration
const registerUser = asyncHandler(async (req, res) => {
    const {userName, email, password, phoneNumber, pan_id, address} = req.body;

    if (!userName || !email || !phoneNumber || !pan_id || !address || !password) {
        throw new ApiError(400, "Please provide all the information.");
    }

    const existUser = await Profile.findOne({
        $or: [{email}, {phoneNumber}]
    });

    if (existUser) {
        throw new ApiError(403, "A user with these credentials already exist");
    }

    const newUser = await Profile.create({
        userName,
        email,
        phoneNumber,
        password,
        pan_id,
        address,
    });

    return res.status(201).json(new ApiResponse(201, "User stored in database.", {
        _id: newUser._id,
        userName: newUser.userName,
        email: newUser.email
    }));
})

const loginUser = asyncHandler(async (req, res) => {
    const {phoneNumber, password} = req.body;

    if (!phoneNumber) {
        throw new ApiError(400, "Phone Number is not provided.");
    }
    if (!password) {
        throw new ApiError(400, "Password is not provided.");
    }

    const existUser = await Profile.findOne({phoneNumber});

    if (!existUser) {
        throw new ApiError(401, "No user with these credentials exists.");
    }

    const isPasswordCorrect = await existUser.comparePassword(password);

    if (!isPasswordCorrect) {
        throw new ApiError(403, "The password is wrong.");
    }

    const loggedInUser = await Profile.findById(existUser._id).select('-password -refreshToken');

    const { accessToken, refreshToken } = await generateTokens(existUser._id);

    const options = {
        httpOnly: true,
        secure: true,
    }

    res.status(200)
    .cookie('refreshToken', refreshToken, options)
    .cookie('accessToken', accessToken, options)
    .json(new ApiResponse(200, "User logged in", {
        user: loggedInUser,
        accessToken,
        refreshToken
    }));
})

const logoutUser = asyncHandler(async (req, res) => {
    await Profile.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: null },
        },
        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, "User logged out", null))
})