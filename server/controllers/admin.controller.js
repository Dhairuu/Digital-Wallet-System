import asyncHandler from "../Utils/asyncHandler";
import ApiError from "../Utils/ApiError";
import ApiResponse from "../Utils/ApiResponse";
import { Transaction } from "../models/transaction.model";
import { Profile } from "../models/profile.model";

const viewUserBalance = asyncHandler(async (req, res) => {
    const { user_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
        throw new ApiError(400, "Invalid User ID");
    }

    const user = await Profile.findOne(
        { _id: user_id, role: "user" },
        { balance: 1 }
    );

    if (!user) {
        throw new ApiError(404, "No user found");
    }

    res.status(200).json(new ApiResponse(200, "User Balance", user.balance));

});

const viewTopUserByBalance = asyncHandler(async (req, res) => {
    const topAccounts = await Account.find({ deleted_at: null })
    .sort({ balance: -1 })
    .limit(10)
    .populate("user_id", "name email");

    res.status(200).json(
        new ApiResponse(200, "Top users by balance", topAccounts)
    );
});

const viewTopUserByTransactionVolume = asyncHandler(async (req, res) => {
    const pipeline = [
        {
          $lookup: {
            from: "accounts",
            localField: "account_id",
            foreignField: "_id",
            as: "account"
          }
        },
        { $unwind: "$account" },
        {
          $group: {
            _id: "$account.user_id",
            totalVolume: { $sum: "$amount" }
          }
        },
        {
          $lookup: {
            from: "profiles",
            localField: "_id",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        { $sort: { totalVolume: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 0,
            userId: "$user._id",
            name: "$user.name",
            email: "$user.email",
            totalVolume: 1
          }
        }
      ];
    
      const topUsers = await Transaction.aggregate(pipeline);
    
      res.status(200).json(new ApiResponse(200, "Top users by transaction volume", topUsers));
});

const viewFlaggedTransactions = asyncHandler(async (req, res) => {
  const flaggedAccounts = await Account.find({ "flagged.status": true });

  if (flaggedAccounts.length === 0) {
    throw new ApiError(404, "No flagged accounts found");
  }

  const flaggedAccountIds = flaggedAccounts.map((account) => account._id);

  const flaggedTransactions = await Transaction.find({account_id: { $in: flaggedAccountIds }}).sort({ createdAt: -1 });

  if (flaggedTransactions.length === 0) {
    throw new ApiError(404, "No transactions found for flagged accounts");
  }

  res.status(200)
  .json(new ApiResponse(200, "Flagged account transactions", flaggedTransactions));
});

export { viewFlaggedTransactions, viewTopUserByBalance, viewUserBalance, viewTopUserByTransactionVolume };