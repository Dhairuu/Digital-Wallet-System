import { Profile } from "../models/profile.model.js";
import jwt from "jsonwebtoken";
import ApiError from "../Utils/ApiError.js";
import asyncHandler from "../Utils/asyncHandler.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!accessToken) {
            throw new ApiError(400, "Unauthorized access");
        }

        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        const user = await Profile.findById(decodedToken?._id).select("-password -refreshToken");

        req.user = user;
        next();
    } catch(error) {
        throw new ApiError(401, error?.message || "Invalid Access Token.");
    }
})

export { verifyJWT }