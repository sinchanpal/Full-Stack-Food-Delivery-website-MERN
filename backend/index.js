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
import http from "http";
import { Server } from 'socket.io';
import { socketHandler } from './socket/socket.js';




// 1. App Config
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;


// Create HTTP server and integrate with Express app. we have to do this because socket.io needs a raw HTTP server to work with, and Express is built on top of it. By creating the server ourselves, we can then pass it to socket.io to enable real-time communication features in our application.

//so basically we can use this app variable to define our routes and middleware, and then we can use the server variable to start the server and listen for incoming requests. This way, we can have both our Express app and socket.io working together seamlessly.
const server = http.createServer(app);

const io = new Server(server, {   //so now we convert our http server to a socket.io server by passing it as an argument to the Server constructor. This allows us to use socket.io's real-time communication features in our application.
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",   // Allow the frontend URL
        credentials: true,                 // Allow cookies to be sent
        methods: ["GET", "POST", "DELETE"] // Allow specific HTTP methods
    }
})

socketHandler(io); //we call the socketHandler function and pass the io instance to it. This allows us to set up our socket.io event listeners and handlers in a separate file, keeping our code organized and modular. By doing this, we can easily manage our real-time communication logic without cluttering our main server file.

app.set('io', io); //we set the io instance on the app object so that we can access it in our controllers and emit events to the clients when certain actions occur, such as when a new order is placed or when an order status is updated. By doing this, we can enable real-time updates in our application and provide a better user experience for our customers.

// 2. Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Allow the frontend URL
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
server.listen(port, () => {
    connectDB();
    console.log(`server started at ${port}`);
})
