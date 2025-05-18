import sendAdminAlert from './sendAdminAlert.js';
import { Transaction } from '../models/transaction.model.js';
const runFraudScan = async () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
    const suspiciousAccounts = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: oneDayAgo },
          status: "success"
        }
      },
      {
        $group: {
          _id: "$account_id",
          transactionCount: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          maxTransaction: { $max: "$amount" }
        }
      },
      {
        $match: {
          $or: [
            { transactionCount: { $gt: 20 } },
            { totalAmount: { $gt: 50000 } },
            { maxTransaction: { $gt: 30000 } }
          ]
        }
      }
    ]);
  
    if (suspiciousAccounts.length) {
      const accountIds = suspiciousAccounts.map(a => a._id);
      
      // Flag accounts in DB
      await Account.updateMany(
        { _id: { $in: accountIds } },
        { $set: { "flagged.status": true, "flagged.reason": "Auto fraud detection" } }
      );
  
      // Send email to admin(s)
      await sendAdminAlert(accountIds, suspiciousAccounts);
    }
  };

export default runFraudScan;