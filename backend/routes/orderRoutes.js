import express from "express";


import { acceptOrderbyDeliveryBoy, getDeliveryBoyAssignments, getMyOrders, placeOrder, updateOrderStatus } from "../controllers/orderControllers.js";
import isAuth from "../middlewares/isAuth.js";


const orderRouter = express.Router();


orderRouter.post('/place-order', isAuth, placeOrder);
orderRouter.get('/my-orders', isAuth, getMyOrders);
orderRouter.post('/update-order-status', isAuth, updateOrderStatus);
orderRouter.get('/get-deliveryboy-assignments', isAuth, getDeliveryBoyAssignments);
orderRouter.post('/accept-delivery-assignment',isAuth,acceptOrderbyDeliveryBoy);



export default orderRouter;