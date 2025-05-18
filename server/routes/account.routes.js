import Router from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { createAccount, deleteAccount, updateAccount } from '../controllers/account.controller.js';

const router = Router();

router.route('/create-account').post(verifyJWT, createAccount);
router.route('/update-account').post(verifyJWT, updateAccount);
router.route('/delete-account').post(verifyJWT, deleteAccount);

export default router;