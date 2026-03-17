import express from "express";


import { acceptOrderbyDeliveryBoy, getCurrentAcceptedOrder, getDeliveryBoyAssignments, getMyOrders, getOrderById, getTodayDeliveryStats, placeOrder, sendDeliveryOTP, updateOrderStatus, verifyDeliveryOtp, verifyRazorPayPayment } from "../controllers/orderControllers.js";
import isAuth from "../middlewares/isAuth.js";


const orderRouter = express.Router();


orderRouter.post('/place-order', isAuth, placeOrder);
orderRouter.post('/verify-payment', isAuth, verifyRazorPayPayment);
orderRouter.get('/my-orders', isAuth, getMyOrders);
orderRouter.post('/update-order-status', isAuth, updateOrderStatus);
orderRouter.get('/get-deliveryboy-assignments', isAuth, getDeliveryBoyAssignments);
orderRouter.post('/accept-delivery-assignment', isAuth, acceptOrderbyDeliveryBoy);
orderRouter.get('/get-current-accepted-order', isAuth, getCurrentAcceptedOrder);
orderRouter.post('/send-delivery-otp', isAuth, sendDeliveryOTP);
orderRouter.post('/verify-delivery-otp', isAuth, verifyDeliveryOtp);
orderRouter.get('/get-order-by-id/:orderId', isAuth, getOrderById);
orderRouter.get('/delivery-stats', isAuth, getTodayDeliveryStats);




export default orderRouter;