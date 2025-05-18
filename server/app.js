import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN,
}));

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(cookieParser());

import userRouter from './routes/user.routes.js';

app.use('/api/v1/user', userRouter);

import walletRouter from './routes/wallet.routes.js';

app.use('/api/v1/wallet', walletRouter);

import accountRouter from './routes/account.routes.js';

app.use('/api/v1/accounts', accountRouter);

import adminRouter from './routes/admin.routes.js';

app.use('/api/v1/admin', adminRouter);

export default app;