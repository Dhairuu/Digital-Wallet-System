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

import UserRouter from './routes/user.routes.js';

app.use('/api/v1/user', UserRouter);

export default app;