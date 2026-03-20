import DeliveryAssignment from "../models/deliveryAssignmentModel.js";
import Order from "../models/orderModel.js";
import Shop from "../models/shopModel.js";
import User from "../models/userModel.js";
import { sendDeliveryOtpMail } from "../utils/sendMail.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import { userSocketMap } from "../socket/socket.js";

dotenv.config();


let instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});



//? place a new order
export const placeOrder = async (req, res) => {
    try {
        const { cartItems, paymentMethod, address, totalCartAmount } = req.body;

        if (cartItems.length == 0 || !cartItems) {
            return res.status(500).json({ message: "Cart is empty" });
        }

        if (!address.text || !address.latitude || !address.longitude) {
            return res.status(500).json({ message: "Address is not valid" });
        }

        const groupItemsByShop = {}

        cartItems.forEach(item => {
            const shopId = item.shop._id; //we store the current item shop id in shopId variable //!

            if (!groupItemsByShop[shopId]) { //find if current shopId key already exist in  groupItemsByShop object
                groupItemsByShop[shopId] = [] //if not means we create a key with shopId and initialize it with empty array
            }
            groupItemsByShop[shopId].push(item) //then we push the item into that array whose key was shopId cause this particular item is from this shop 
        });

        const shopOrders = await Promise.all(Object.keys(groupItemsByShop).map(async (shopId) => { //now groupItemsByShop obj has key val pair where keys are each shopId and we loop through each shopId and find shop using the shopId
            const shop = await Shop.findById(shopId).populate("owner");

            if (!shop) {
                return res.status(500).json({ message: "Shop not found." });
            }

            const orderItems = groupItemsByShop[shopId];
            const subTotal = orderItems.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0) //calculate each shop ordered item subTotal

            return {
                shop: shop._id,
                owner: shop.owner._id,
                subTotal,
                shopOrderItems: orderItems.map((i) => (
                    {
                        item: i.id,
                        name: i.name,
                        price: i.price,
                        quantity: i.quantity
                    }
                ))
            }
        }));


        //? if payment method is online then we also create a order in razorpay dashboard using razorpay instance and return the razorpay order details to frontend for further process of payment.

        if (paymentMethod === "online") {

            const razorpayOrder = await instance.orders.create({   //using the razorpay instance we create a order in razorpay dashboard and we store the returned order details in razorpayOrder variable
                amount: totalCartAmount * 100, //amount should be in paisa
                currency: "INR",
                receipt: `receipt_order_${new Date().getTime()}` //receipt is a unique id which is used to identify the order in razorpay dashboard and we create it using current timestamp
            })

            const newOrder = await Order.create({  //create the new  order with all the details
                user: req.userId,
                paymentMethod,
                deliveryAddress: address,
                totalAmount: totalCartAmount,
                razorpayOrderId: razorpayOrder.id,
                payment: false,  //here we set payment false because user not yet paid we just created the order in razorpay dashboard but user not yet complete the payment so we set payment false and after payment successfull we update this field to true
                shopOrders
            })


            return res.status(200).json({
                razorpayOrder,
                orderId: newOrder._id,
                key_id: process.env.RAZORPAY_KEY_ID
            });


        }

        //? if payment method is cod then we directly create the order in our database without creating order in razorpay dashboard because for cod there is no need to create order in razorpay dashboard and we directly return the created order details to frontend

        const newOrder = await Order.create({  //create the new  order with all the details
            user: req.userId,
            paymentMethod,
            deliveryAddress: address,
            totalAmount: totalCartAmount,
            shopOrders
        })

        await newOrder.populate("user", "fullName email mobile");
        await newOrder.populate("shopOrders.shopOrderItems.item", "image name price");
        await newOrder.populate("shopOrders.shop", "name");
        await newOrder.populate("shopOrders.owner", "fullName email mobile socketId");

        //? Here we Implement socket io for place order in COD mode . so that now when user place any order from any resturant and click enter the order details will instantly shown in owner my order section
        const io = req.app.get("io"); //here we get the io instance from our app.js where we set it in app.set("io", io);

        if (io) {

            const plainNewOrder = newOrder.toObject(); // newOrder is a massive, complex Mongoose Document with hidden database methods. Socket.io cannot send Mongoose documents properly unless you convert them to plain JavaScript objects first using .toObject().

            plainNewOrder?.shopOrders?.forEach((shopOrder) => {

                const shopOwnerId = shopOrder.owner._id.toString(); //here we get the shop owner id from the shopOrder details
                const ownerSocketId = userSocketMap[shopOwnerId]; //using the shop owner id we get the socket id of that shop owner from our userSocketMap which we maintain in our socket.js file


                // Check if the shop owner is currently online (has an active socket connection)
                if (ownerSocketId) {
                    // io.to(socketId) ensures we send a private, real-time message ONLY to this specific restaurant owner, not to everyone.
                    io.to(ownerSocketId).emit("new-order", {
                        ...plainNewOrder,  // Spread the main order details (customer info, delivery address, payment method, etc.)
                        shopOrders: [shopOrder]  // CRITICAL OVERRIDE: 
                        // 1. Privacy: We overwrite the main 'shopOrders' data so this owner ONLY sees their own items, not items the user might have ordered from other restaurants at the same time.
                        // 2. Data Structure: We wrap 'shopOrder' in an array [] because our frontend MyOrders.jsx expects an array (it uses newOrder?.shopOrders[0]) but here we send only one object (shopOrder).
                    })
                }
            })
        }

        console.log("Order placed successfully");
        return res.status(200).json(newOrder);

    } catch (error) {
        return res.status(500).json({ message: "Error while placing order", error });
    }
}

// groupItemsByShop = {
//     dominosId: [pizza , garlic bread]
//     burgerKingId: [burger]
// }

export const verifyRazorPayPayment = async (req, res) => {

    try {
        const { razorpay_payment_id, orderId } = req.body;

        const checkPayment = await instance.payments.fetch(razorpay_payment_id); //using razorpay instance we fetch the payment details from razorpay dashboard using the razorpay_payment_id which is returned by frontend after successful payment

        if (!checkPayment || checkPayment.status !== "captured") { //if there is no payment details found or the payment status is not captured then we return error

            return res.status(400).json({ message: "Payment not successfull" });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(400).json({ message: "order not found !" });
        }

        order.payment = true; //if payment is successfull then we update the order payment field to true
        order.razorpayPaymentId = razorpay_payment_id; //we also store the razorpay_payment_id in our order for future reference
        await order.save();

        await order.populate("user", "fullName email mobile");
        await order.populate("shopOrders.shopOrderItems.item", "image name price");
        await order.populate("shopOrders.shop", "name");
        await order.populate("shopOrders.owner", "fullName email mobile socketId");

        //? Here we Implement socket io for place order in Online mode . so that now when user place any order from any resturant in online mode and click enter the order details will instantly shown in owner my order section
        const io = req.app.get("io"); //here we get the io instance from our app.js where we set it in app.set("io", io);

        if (io) {

            const plainNewOrder = order.toObject(); // order is a massive, complex Mongoose Document with hidden database methods. Socket.io cannot send Mongoose documents properly unless you convert them to plain JavaScript objects first using .toObject().

            plainNewOrder?.shopOrders?.forEach((shopOrder) => {

                const shopOwnerId = shopOrder.owner._id.toString(); //here we get the shop owner id from the shopOrder details
                const ownerSocketId = userSocketMap[shopOwnerId]; //using the shop owner id we get the socket id of that shop owner from our userSocketMap which we maintain in our socket.js file


                // Check if the shop owner is currently online (has an active socket connection)
                if (ownerSocketId) {
                    // io.to(socketId) ensures we send a private, real-time message ONLY to this specific restaurant owner, not to everyone.
                    io.to(ownerSocketId).emit("new-order", {
                        ...plainNewOrder,  // Spread the main order details (customer info, delivery address, payment method, etc.)
                        shopOrders: [shopOrder]  // CRITICAL OVERRIDE: 
                        // 1. Privacy: We overwrite the main 'shopOrders' data so this owner ONLY sees their own items, not items the user might have ordered from other restaurants at the same time.
                        // 2. Data Structure: We wrap 'shopOrder' in an array [] because our frontend MyOrders.jsx expects an array (it uses newOrder?.shopOrders[0]) but here we send only one object (shopOrder).
                    })
                }
            })
        }

        return res.status(200).json(order);



    } catch (error) {
        return res.status(500).json({ message: "Error while verifying payment", error });
    }
}



//? get all orders of logged in user (both user and owner)
export const getMyOrders = async (req, res) => {

    try {

        const user = await User.findById(req.userId);

        if (user.role == "user") {
            const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("shopOrders.owner", "fullName email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")

            return res.status(200).json(orders);


        } else if (user.role == "owner") {

            // 1. Find the orders where THIS owner is involved
            const orders = await Order.find({ "shopOrders.owner": req.userId }).sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("user", "fullName email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")
                .populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")
                .lean(); //  use .lean() to get plain JavaScript objects so we can modify them easily;

            // 2. FILTER the array
            // We loop through every order found
            const filteredOrders = orders.map((order) => {

                // Inside each order, we filter the 'shopOrders' array
                // We only keep the specific sub-order that belongs to the current logged-in owner
                const mySpecificShopOrders = order.shopOrders.filter((subOrder) => subOrder.owner.toString() === req.userId);

                return {
                    ...order,
                    shopOrders: mySpecificShopOrders
                };
            });

            // We return the order, but we replace the list with our filtered list
            return res.status(200).json(filteredOrders);
        }




    } catch (error) {
        return res.status(500).json({ message: "Error while fetch orders", error });
    }
}



//TODO I have to check this function later and understand it properly
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, shopOrderId, status } = req.body;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const shopOrder = order?.shopOrders?.find(so => so.shop == shopOrderId);

        if (!shopOrder) {
            return res.status(404).json({ message: "Shop order not found" });
        }
        shopOrder.status = status;


        //? now here we write logic for if status is out for delivery then we 1st find the near by(around 5km) all delivery boys and send a notification to the particular delivery boys who are available for delivery

        let deliveryBoysPayload = []; //here we store all our available delivery boys data.
        let newDeliveryAssignment = null; //here we store the created delivery assignment for this shop order
        let availableDeliveryBoysIds = []; //here we store all the available delivery boys ids who are near by 5km for this shop order delivery

        if (status == "out-for-delivery" && !shopOrder.orderAssignment) {
            //1. find the order delivery address
            const { latitude, longitude } = order.deliveryAddress;

            //2. find all delicery boys
            const nearByDeliveryBoys = await User.find({
                role: "deliveryBoy",
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [Number(longitude), Number(latitude)]

                        },
                        $maxDistance: 5000 //5km
                    }
                }
            });

            //3. Now we filter those delivery boys who are available for delivery

            const nearByDBids = nearByDeliveryBoys.map(db => db._id);

            const busyDBids = await DeliveryAssignment.find({
                assignedTo: { $in: nearByDBids },
                status: "assigned"
            }).distinct("assignedTo");  //here the logic is we find all delivery assignments whose assignedTo is in nearByDBids array and status is not pending ,preparing or delivered means they are busy in some delivery assignment and we get the distinct assignedTo ids from the found delivery assignments.Note normal find return the whole DeliveryAssignment data but we only need the delivery boys ids so distinct("assignedTo"); give us the  returned  ids which are filtered by {$in: nearByDBids},

            const busyIdsSet = new Set(busyDBids.map((id) => String(id)))  //here we basically make a set using our busyDBids . Its just for effecienty (basically if there is any duplicate id then set removes the duplicate)

            const availableDeliveryBoys = nearByDeliveryBoys.filter(db => !busyIdsSet.has(String(db._id))); //here we filter the nearByDeliveryBoys whose id is not in busyIdsSet means they are available for delivery

            //now we have all the delivery boys ids who are available and near 5 km
            availableDeliveryBoysIds = availableDeliveryBoys.map(db => db._id);

            if (availableDeliveryBoysIds.length == 0) {
                await order.save();
                return res.json({ message: "Order status is Saved but there is no avaliable delivery boys" })
            }

            //create a delivery assignment for this shop order
            newDeliveryAssignment = await DeliveryAssignment.create({
                order: order._id,     //here we store the main order_id where this shopOrder belongs 

                shop: shopOrder.shop,    //out of all shopOrder in shopOrders here we store the shop details of particular shopOrder whose owner change the status to out-for-delivery 

                shopOrderId: shopOrder._id,  //from all the shopOrders we store the particular shopOrder id here to know for which shopOrder this delivery assignment is created like in a main order shopOrders there are 2 shopOrder 1.dominoz 2.burger king now owner of dominoz change the status to out-for-delivery so out of all 2 shopOrders we store the particular dominoz shopOrderId here

                broadcastedTo: availableDeliveryBoysIds,  //here we store the all near 5km available delivery boys ids 

                status: "brodcasted"  //before any delivery boy accept the order we make the status brodcasted
            })

            shopOrder.orderAssignment = newDeliveryAssignment._id;  //now a initial newDeliveryAssignment is created so we store its id in the particular shopOrder.orderAssignment field which we created in order model
            shopOrder.assignedDeliveryBoy = newDeliveryAssignment.assignedTo;

            deliveryBoysPayload = availableDeliveryBoys.map(b => (
                {
                    id: b._id,
                    fullName: b.fullName,
                    longitude: b.location?.coordinates?.[0],
                    latitude: b.location?.coordinates?.[1],
                    mobile: b.mobile
                }
            ))


        }



        await order.save();         //now we successfully updated the shopOrder status

        const updatedShopOrder = order?.shopOrders?.find(so => so.shop == shopOrderId);


        await order.populate("shopOrders.shop", "name address")
        await order.populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")
        await order.populate("shopOrders.shopOrderItems.item", "name image price");

        //? now here we emit socket event to  the frontend to update the order status . so that if the owner of the resturant update the order status it will instantly update in the customer my order section.

        const io = req.app.get("io");
        if (io) {
            const customerId = order.user.toString();  //here we find the customer id from the order details because we want to send the order status update notification to the particular customer who place this order.
            const customerSocketId = userSocketMap[customerId];  //using the customer id we get the socket id of that customer from our userSocketMap which we maintain in our socket.js file

            if (customerSocketId) {

                io.to(customerSocketId).emit("order-status-updated", {
                    orderId: orderId, // Send the main order ID
                    shopOrderId: shopOrderId, // Send the specific shop's order ID
                    status: status,              // Send the new status string (e.g. "preparing")
                    userId: customerId  // Send the user ID to identify which customer's order status is updated
                })
            }
        }


        //? BROADCAST TO NEARBY DELIVERY BOYS
        // Only trigger this if the status changed to out-for-delivery AND we actually found nearby boys
        if (status === "out-for-delivery" && availableDeliveryBoysIds && availableDeliveryBoysIds.length > 0) {

            // Loop through every available delivery boy we found within 5km
            availableDeliveryBoysIds.forEach((boyId) => {
                const deliveryBoySocketId = userSocketMap[boyId.toString()]; //find each delivery boy socket id 

                // If this specific delivery boy is currently online... we send them a real-time notification about this new delivery assignment that they can accept. We also send some key details about the order so they can make an informed decision about accepting it or not.
                if (deliveryBoySocketId) {
                    io.to(deliveryBoySocketId).emit("new-delivery-assignment", {
                        deliveryBoyId: boyId,
                        assignmentId: newDeliveryAssignment._id,
                        orderId: order._id,
                        shopName: updatedShopOrder.shop.name,
                        shopAddress: updatedShopOrder.shop.address,
                        deliveryAddress: order.deliveryAddress,
                        shopOrderItems: updatedShopOrder.shopOrderItems,
                        subTotal: updatedShopOrder.subTotal
                    })
                }
            })
        }




        return res.status(200).json(
            {
                shopOrder: updatedShopOrder,
                assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
                availableDeliveryBoys: deliveryBoysPayload,
                assignmentId: updatedShopOrder?.orderAssignment?._id
            }
        );

    } catch (error) {
        return res.status(500).json({ message: "Error while updating order status", error });
    }
}



export const getDeliveryBoyAssignments = async (req, res) => {
    try {
        const deliveryBoyId = req.userId;
        const deliveryAssignments = await DeliveryAssignment.find({
            status: "brodcasted", //here we only fetch those delivery assignments whose status is brodcasted
            broadcastedTo: deliveryBoyId //here if broadcastedTo array contain the deliveryBoy id then only we send him a delivery assignment notification
        }).populate("order")
            .populate("shop")
        //.populate("shopOrderId", "shopOrderItems subTotal");  //here in populate 1st param is the field to populate and 2nd param is the fields to select from that populated model

        const payload = deliveryAssignments.map(da => ({
            assignmentId: da?._id,
            orderId: da?.order?._id,
            shopName: da?.shop?.name,
            shopAddress: da?.shop?.address,
            deliveryAddress: da?.order?.deliveryAddress,
            shopOrderItems: da?.order?.shopOrders?.find(so => so._id.toString() === da?.shopOrderId.toString())?.shopOrderItems || [],  //! here is a error shopOrderItems & subTotal are now showing I have to correct it
            subTotal: da?.order?.shopOrders?.find(so => so._id.toString() === da?.shopOrderId.toString())?.subTotal || 0,
        }));

        return res.status(200).json(payload);
    } catch (error) {
        return res.status(500).json({ message: "Error while fetching delivery assignments", error });
    }
}


export const acceptOrderbyDeliveryBoy = async (req, res) => {
    try {
        const { assignmentId } = req.body;
        const deliveryBoyId = req.userId;

        const assignment = await DeliveryAssignment.findById(assignmentId);


        if (!assignment) {
            return res.status(500).json({ message: "Delivery Assignment not found !" });
        }

        if (assignment.status != "brodcasted") {
            return res.status(500).json({ message: "Delivery Assignment is expired !" });
        }

        //means we check if our delivery boy already assigned to a particular not completed order 
        const alreadyAcceptedOrder = await DeliveryAssignment.find({
            assignedTo: deliveryBoyId,
            status: "assigned"
        })

        if (alreadyAcceptedOrder.length > 0) {
            return res.status(500).json({ message: "Delivery Boy already Assigned to a particular order and the order is not completed yet !" });
        }

        assignment.assignedTo = deliveryBoyId; //store the deliveryBoy id to assignedTo field
        assignment.status = "assigned";  //change the status to assigned
        assignment.acceptedAt = new Date(); //store the accept time

        await assignment.save();

        //find the order
        const order = await Order.findById(assignment.order);
        if (!order) {
            return res.status(500).json({ message: "Order not found !" });
        }

        //find the particular shopOrder
        const shopOrder = order.shopOrders.find(so => so._id.toString() === assignment.shopOrderId.toString());
        if (!shopOrder) {
            return res.status(500).json({ message: "Shop Order not found !" });
        }

        //update the particular shopOrder assignedDeliveryBoy field with accepted deliveryBoy Id
        shopOrder.assignedDeliveryBoy = deliveryBoyId;
        await order.save();


        return res.status(200).json({ message: "Order accepted successfully !" });
    } catch (error) {
        return res.status(500).json({ message: "Error while accepting order", error });
    }
}

//get the order which is accepted by the current delivery boy
export const getCurrentAcceptedOrder = async (req, res) => {
    try {
        const deliveryBoyId = req.userId; //!

        const currAssignment = await DeliveryAssignment.findOne({
            assignedTo: deliveryBoyId,
            status: "assigned"
        }).populate("shop", "name address")
            .populate("assignedTo", "fullName email mobile location") //note this is delivery boy user details
            .populate({         //in this way we populate currAssignment-->order-->user
                path: "order",
                populate: [{ path: "user", select: "fullName email mobile location" }]  //note this is customer user details
            })


        if (!currAssignment) {
            return res.status(500).json({ message: "Assignment not found !" });
        }

        if (!currAssignment.order) {
            return res.status(500).json({ message: " Order not found !" });
        }

        const shopOrder = currAssignment.order.shopOrders.find(so => so._id.toString() == currAssignment.shopOrderId.toString());
        if (!shopOrder) {
            return res.status(500).json({ message: " shopOrder not found !" });
        }

        let deliveryBoyLocation = { lat: null, lon: null };

        if (currAssignment.assignedTo.location.coordinates) {
            deliveryBoyLocation.lat = currAssignment?.assignedTo?.location?.coordinates[1];
            deliveryBoyLocation.lon = currAssignment?.assignedTo?.location?.coordinates[0];
        }


        let customerLocation = { lat: null, lon: null };

        if (currAssignment.order.deliveryAddress) {
            customerLocation.lat = currAssignment?.order?.deliveryAddress?.latitude;
            customerLocation.lon = currAssignment?.order?.deliveryAddress?.longitude;
        }


        return res.status(200).json({
            _id: currAssignment.order._id,
            user: currAssignment.order.user,
            shop: currAssignment.shop,
            shopOrder,
            deliveryAddress: currAssignment.order.deliveryAddress,
            deliveryBoyLocation,
            customerLocation
        })




    } catch (error) {
        return res.status(500).json({ message: "Current accept order error: ", error });
    }
}

//get a particular order by its ID
export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId)
            .populate("shopOrders.shop")
            .populate("shopOrders.assignedDeliveryBoy")
            .populate("shopOrders.shopOrderItems.item")
            .lean();

        if (!order) {
            return res.status(500).json({ message: "Order Not Found ! " });
        }

        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ message: "Error in getOrderById conroller: ", error });
    }
}



export const sendDeliveryOTP = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.body; //we fetch orderId , shopOrderId cause using this we find the user whom we send the otp 
        const order = await Order.findById(orderId).populate("user");
        const shopOrder = order.shopOrders.find((so) => so._id.toString() == shopOrderId.toString());

        if (!order || !shopOrder) {
            return res.status(500).json({ message: "Enter a valid order or shopOrder" });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString(); //generate a otp
        shopOrder.deliveryOtp = otp; //store the otp in corrosponding shopOrder deliveyOtp field
        shopOrder.otpExpires = Date.now() + 5 * 60 * 1000; //otp expires in 5 min

        await order.save();
        await sendDeliveryOtpMail(order?.user, otp);

        return res.status(200).json({ message: `Delivery Otp is successfully send to ${order?.user?.fullName}` });
    } catch (error) {

        console.log("🚨 SEND OTP ERROR:", error);
        return res.status(500).json({ message: "Error in sendDeliveryOTP conroller:" });
    }
}


export const verifyDeliveryOtp = async (req, res) => {
    try {
        const { otp, orderId, shopOrderId } = req.body;
        const order = await Order.findById(orderId).populate("user");
        const shopOrder = order.shopOrders.find((so) => so._id.toString() == shopOrderId.toString());

        if (!order || !shopOrder) {
            return res.status(500).json({ message: "Enter a valid order or shopOrder" });
        }

        if (String(shopOrder.deliveryOtp) !== String(otp) || shopOrder.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid/Expired OTP" });
        }

        shopOrder.deliveryOtp = null;
        shopOrder.otpExpires = null;
        shopOrder.status = "delivered";
        shopOrder.deliverAt = Date.now();

        await order.save();

        await DeliveryAssignment.deleteOne({   //after the order is delivered now we can delete the DeliveryAssignment so that this order now not show in delivery boy dashboard
            order: order._id,
            shopOrderId: shopOrder._id,
            assignedTo: shopOrder.assignedDeliveryBoy

        });

        //TODO: here this logic is not worked when delivery boy click verify  otp after that in customer my order section the particular order status does't change we have to check it later 
        //? Notify the customer that their order has been successfully delivered!
        const io = req.app.get("io");

        if (io && order?.user) {
            const customerId = order.user._id.toString();
            const customerSocketId = userSocketMap[customerId];

            if (customerSocketId) {
                io.to(customerSocketId).emit("order-status-updated", {
                    orderId: orderId, // Send the main order ID
                    shopOrderId: shopOrder?.shop, // Send the specific shop's order ID
                    status: "delivered",              // Send the new status string (e.g. "preparing")
                    userId: customerId  // Send the user ID to identify which customer's order status is updated
                });
            }
        }

        return res.status(200).json({ message: "Order Delivered Successfully!" });

    } catch (error) {
        return res.status(500).json({ message: "Error in verifyDeliveryOtp controller", error: error.message });
    }
}




//? Get today's delivery stats and earnings for the Delivery Boy dashboard chart
export const getTodayDeliveryStats = async (req, res) => {
    try {
        const deliveryBoyId = req.userId;

        // 1. Get the exact start and end time of TODAY
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // 12:00:00 AM today

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999); // 11:59:59 PM today

        // 2. Find all orders where THIS delivery boy successfully delivered a shopOrder TODAY
        const orders = await Order.find({
            "shopOrders.assignedDeliveryBoy": deliveryBoyId,
            "shopOrders.status": "delivered",
            "shopOrders.deliverAt": { $gte: startOfDay, $lte: endOfDay } //filter shopOrders which are delivered today
        });

        let totalEarnings = 0;
        const hourlyCounts = {}; // This will hold data like: { "12:00": 2, "13:00": 3 }

        // 3. Loop through the orders to calculate earnings and group by hour
        orders.forEach(order => {
            order.shopOrders.forEach(so => {
                if (so.assignedDeliveryBoy.toString() === deliveryBoyId && so.status === "delivered" && so.deliverAt >= startOfDay && so.deliverAt <= endOfDay) {
                    totalEarnings += 40; // Delivery boy earns flat ₹40 per delivery

                    // Extract the hour (e.g., if delivered at 14:35, we extract "14")
                    const date = new Date(so.deliverAt);
                    const hourString = date.getHours().toString().padStart(2, '0') + ":00"; // e.g., "14:00"

                    // Increment the count for this specific hour

                    if (hourlyCounts[hourString]) {
                        hourlyCounts[hourString] += 1;
                    } else {
                        hourlyCounts[hourString] = 1;
                    }
                }
            });
        });

        // 4. Format the data perfectly for the Recharts library on the frontend
        // It expects an array of objects: [{ time: "12:00", deliveries: 2 }, ...]

        const chartData = Object.keys(hourlyCounts).sort().map(hour => ({
            time: hour,
            deliveries: hourlyCounts[hour]
        }));


        return res.status(200).json({ totalEarnings, chartData });
    } catch (error) {
        console.error("Error in getTodayDeliveryStats:", error);
        return res.status(500).json({ message: "Error fetching delivery stats", error });
    }
}