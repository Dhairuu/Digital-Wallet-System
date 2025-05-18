import { Router } from "express";
import { verifyAdmin } from "../middlewares/auth.middleware";
import { viewFlaggedTransactions, viewTopUserByBalance, viewTopUserByTransactionVolume, viewUserBalance } from "../controllers/admin.controller";

const router = Router();

router.route('/user/:user_id/balance').get(verifyAdmin, viewUserBalance);
router.route('/top-users-balance').post(verifyAdmin, viewTopUserByBalance);
router.route('/top-users-transaction').post(verifyAdmin, viewTopUserByTransactionVolume);
router.route('/flagged-transactions').post(verifyAdmin, viewFlaggedTransactions);

export default router;