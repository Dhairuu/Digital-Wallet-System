import mongoose from "mongoose";
import asyncHandler from "../Utils/asyncHandler.js";
import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import { Account } from "../models/account.model.js";
import { Transaction } from "../models/transaction.model.js";
import currencyConverter from "../Utils/currencyConverter.js";

const deposit = asyncHandler(async (req, res) => {
    const { account_id, deposit_amount, currency } = req.body;
    let new_deposit_amount = deposit_amount;
    if (!mongoose.Types.ObjectId.isValid(account_id)) {
        throw new ApiError(400, "Invalid account id type");
    }

    if (typeof deposit_amount !== "number" || !isFinite(deposit_amount)) {
        throw new ApiError(400, "Invalid deposit amount input.");   
    }

    if (deposit_amount < 0) {
        throw new ApiError(402, "Deposit amount needs to be positive.");
    }

    const account = await Account.findOne(
        {_id: account_id, user_id: req.user._id, deleted_at: null}
    );

    if (!account) {
        throw new ApiError(400, "Account not found");
    }

    if (currency.toUpperCase() !== account.currency) {
        new_deposit_amount = currencyConverter(new_deposit_amount, currency.toUpperCase(), account.currency);
    }

    const updatedAccount = await Account.findOneAndUpdate(
        { _id: account_id, user_id: req.user._id, deleted_at: null },
        { $inc: { balance: new_deposit_amount } },
        { new: true }
    );

    if(!updatedAccount) {
        await Transaction.create({
            account_id: account_id,
            transaction_type: "deposit",
            status: "failed",
            amount: new_deposit_amount,
            metadata: {
                reason: "Account not found",
                attempted_by: req.user._id
            }
        })
        throw new ApiError(500, "Deposit Failed.");
    }

    const transactionLog = await Transaction.create({
        account_id: updatedAccount._id,
        transaction_type: "deposit",
        amount: new_deposit_amount,
        status: "success",
        metadata: {
            from_account: null,
            to_account: updatedAccount._id,
            deposited_by: req.user._id,
        }
    })

    res.status(200)
    .json(new ApiResponse(200, "Deposit transaction complete", {
        account_detail: updatedAccount,
        transaction_log: transactionLog
    }))

});

const withdraw = asyncHandler(async (req, res) => {
    const { withdraw_amount, account_id, currency } = req.body;
    let new_withdraw_amount = withdraw_amount;

    if (!mongoose.Types.ObjectId.isValid(account_id)) {
        throw new ApiError(400, "Invalid account Id.");
    }

    if (typeof withdraw_amount !== "number" || !isFinite(withdraw_amount)) {
        throw new ApiError(400, "Invalid withdraw amount.");
    }

    if (withdraw_amount < 0) {
        throw new ApiError(400, "Withdraw amount needs to be a positive number.");
    }

    const account = await Account.findOne({
        _id: account_id,
        user_id: req.user._id,
        deleted_at: null,
        "flagged.status": false,
    });

    if (!account) {
        throw new ApiError(404, "Account with these credentials was not found.");
    }

    if (currency.toUpperCase() !== account.currency) {
        new_withdraw_amount = currencyConverter(new_withdraw_amount, currency.toUpperCase(), account.currency);
    }

    if (account.balance < new_withdraw_amount) {
        await Transaction.create({
            account_id: account_id,
            transaction_type: "withdraw",
            status: "failed",
            amount: new_withdraw_amount,
            description: "Insufficient balance.",
            metadata: {
                reason: "Insufficient balance",
                attempted_by: req.user._id
            }
        })
        throw new ApiError(402, "Insufficient funds.");
    }

    const updatedAccount = await Account.findOneAndUpdate(
        {
            _id: account_id,
            balance: { $gte: new_withdraw_amount }
        },
        { $inc: { balance: -new_withdraw_amount } },
        { new: true }
    );

    if (!updatedAccount) {
        await Transaction.create({
            account_id: account_id,
            transaction_type: "withdraw",
            status: "failed",
            amount: new_withdraw_amount,
            metadata: {
                reason: "Race condition or update failure",
                attempted_by: req.user._id,
            }
        })
        throw new ApiError(500, "Withdrawal failed due to internal error.");
    }

    const transactionLog = await Transaction.create({
        account_id: updatedAccount._id,
        transaction_type: "withdraw",
        amount: new_withdraw_amount,
        status: "success",
        metadata: {
            from_account: updatedAccount._id,
            to_account: null,
            withdrawal_by: req.user._id,
        }
    });

    res.status(200).json(new ApiResponse(200, "Withdrawal Successful", {
        account_detail: updatedAccount,
        transaction_log: transactionLog
    }));
});

const transferFunds = asyncHandler(async(req, res) => {
    const { from_account_id, to_account_id, transfer_amount } = req.body;
    let new_transfer_amount = transfer_amount;
    if (!mongoose.Types.ObjectId.isValid(from_account_id) || !mongoose.Types.ObjectId.isValid(to_account_id)) {
        throw new ApiError(400, "Invalid account(s) type.");
    }

    if (typeof transfer_amount !== "number" || !isFinite(transfer_amount)) {
        throw new ApiError(400, "Invalid transfer amount.");
    }

    if (transfer_amount < 0) {
        throw new ApiError(400, "Transfer amount needs to be a positive number.");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const [from_account, to_account] = await Promise.all([
            Account.findOne({ _id: from_account_id, user_id: req.user._id, deleted_at: null, "flagged.status": false }).session(session),
            Account.findOne({ _id: to_account_id, deleted_at: null, "flagged.status": false }).session(session)
        ])

        if (!from_account) {
            throw new ApiError(400, "Account with these credentials either flagged or doesn't exist");
        }
        if (!to_account) {
            throw new ApiError(400, "Recipient account either flagged or doesn't exist");
        }

        if (from_account.currency !== to_account.currency) {
            new_transfer_amount = currencyConverter(new_transfer_amount, from_account.currency, to_account.currency);
        }

        if (from_account.balance < transfer_amount) {
            await Transaction.create([{
                account_id: from_account_id,
                transaction_type: "transfer",
                status: "failed",
                amount: transfer_amount,
                description: "Insufficient funds for transfer",
                metadata: {
                    to_account: to_account_id,
                    from_account: from_account_id,
                    attempted_by: req.user._id,
                }
            }], { session })
            throw new ApiError(401, "Insufficient Balance.");
        }

        from_account.balance -= transfer_amount;
        to_account.balance += new_transfer_amount;

        await from_account.save({ session });
        await to_account.save({ session });

        const transactionLog = await Transaction.create([{
            account_id: from_account_id,
            transaction_type: "transfer",
            status: "success",
            amount: transfer_amount,
            description: `Transferred ₹${transfer_amount} to account ${to_account_id}`,
            metadata: {
                from_account: from_account_id,
                to_account: to_account_id,
                transferred_by: req.user._id,
            }
        }, {
            account_id: to_account_id,
            transaction_type: "deposit",
            status: "success",
            amount: new_transfer_amount,
            description: `Received ₹${transfer_amount} from account ${from_account_id}`,
            metadata: {
                from_account: from_account_id,
                to_account: to_account_id,
                received_by: to_account.user_id,
            }
        }], { session, ordered: true });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json(new ApiResponse(200, "Transfer successful", {
            from_account: from_account,
            to_account: to_account,
            transaction_logs: transactionLog
        }));

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(error.status || 500, error.message || "Transfer failed.");
    }
});

export { deposit, withdraw, transferFunds };