import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import shopRouter from './routes/shopRoutes.js';
import itemRouter from './routes/itemsRoutes.js';
import orderRouter from './routes/orderRoutes.js';



// 1. App Config
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// 2. Middleware
app.use(cors({
    origin: "http://localhost:5173", // Allow the frontend URL
    credentials: true // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);



// 3. Start Server
app.listen(port, () => {
    connectDB();
    console.log(`server started at ${port}`);
})
