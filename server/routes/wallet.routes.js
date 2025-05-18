import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deposit, transferFunds, withdraw } from "../controllers/wallet.controller.js";

const router = Router();

router.route('/deposit').post(verifyJWT, deposit);
router.route('/withdraw').post(verifyJWT, withdraw);
router.route('/transfer').post(verifyJWT, transferFunds);

export default router;