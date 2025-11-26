import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js';

// 1. App Config
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// 2. Middleware
app.use(express.json());
app.use(cors());

// 3. Start Server
app.listen(port ,()=>{
    connectDB();
    console.log(`server started at ${port}`);
})
