import { Router } from "express";
import { loginUser, logoutUser, registerUser, viewTransactionHistory } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

//Secure route
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/view-transaction-history').post(verifyJWT, viewTransactionHistory);
export default router;