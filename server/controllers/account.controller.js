import mongoose from "mongoose";
import asyncHandler from "../Utils/asyncHandler.js";
import { Account } from "../models/account.model.js";
import { Transaction } from "../models/transaction.model.js";
import ApiError from '../Utils/ApiError.js';
import ApiResponse from "../Utils/ApiResponse.js";
import currencyConverter from "../Utils/currencyConverter.js";

const createAccount = asyncHandler(async (req, res) => {
    const { account_name, bank_id, account_type, initial_balance = 0, currency = "INR" } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(bank_id)) {
        throw new ApiError(403, "Invalid Bank Id Type.");
    }

    if (!account_name) {
        throw new ApiError(401, "Account name is not provided.");
    }

    if (initial_balance < 0) {
        throw new ApiError(401, "Initial balance needs to be a positive number.");
    }

    if (account_type == "savings") {
        const existingAccount = await Account.findOne(
            { user_id: req.user._id, bank_id: bank_id, account_type: "savings", deleted_at: null }
        );
        if (existingAccount) {
            throw new ApiError(409, "Savings account already exists.");
        }
    }

    const newAccount = await Account.create({
        account_name: account_name,
        user_id: req.user._id,
        bank_id: bank_id,
        account_type: account_type || "savings",
        balance: initial_balance,
        currency: currency.toUpperCase()
    })

    let transactionLog = null;

    if (initial_balance > 0) {
        transactionLog = await Transaction.create({
            account_id: newAccount._id,
            transaction_type: "deposit",
            description: `Initial deposit to the account.`,
            status: "success",
            amount: initial_balance,
            metadata: {
                from_account: null,
                to_account: newAccount._id,
                deposited_by: req.user._id
            }
        })
    }

    res.status(201).json(new ApiResponse(201, "Account created", {
        account: newAccount,
        initial_transaction: transactionLog
    }))
});

const updateAccount = asyncHandler(async (req, res) => {
    const { new_currency, new_account_name, account_id } = req.body;
    let updatedData = {};
    if (!mongoose.Types.ObjectId.isValid(account_id)) {
        throw new ApiError(400, "Invalid Account Id Type");
    }

    const account = await Account.findOne(
        { _id: account_id, user_id: req.user._id, deleted_at: null }
    );

    if (!account) {
        throw new ApiError(404, "Account not found");
    }

    if (new_currency && new_currency.toUpperCase() !== account.currency) {
        updatedData['balance'] = currencyConverter(account.balance, account.currency, new_currency.toUpperCase());
        updatedData['currency'] = new_currency.toUpperCase();
    }

    if (new_account_name) {
        updatedData['account_name'] = new_account_name.trim();
    }

    const updatedAccount = await Account.findOneAndUpdate(
        { _id: account_id, user_id: req.user._id, deleted_at: null },
        { $set: updatedData },
        { new: true }
    );

    if (!updatedAccount) {
        throw new ApiError(401, "Updation account failed");
    }

    res.status(200).json(new ApiResponse(200, "Account update successful", {
        updatedAccount: updatedAccount
    }));

});

const deleteAccount = asyncHandler(async (req, res) => {
    const { account_id } = req.body;
  
    if (!mongoose.Types.ObjectId.isValid(account_id)) {
      throw new ApiError(400, "Invalid Account Id");
    }
  
    const account = await Account.findOne({ _id: account_id, user_id: req.user._id, deleted_at: null });
  
    if (!account) {
      throw new ApiError(404, "Account not found or already deleted");
    }
  
    account.deleted_at = new Date();
  
    await account.save();
  
    res.status(200).json(new ApiResponse(200, "Account soft deleted successfully"));
});
  

export { createAccount, updateAccount, deleteAccount };