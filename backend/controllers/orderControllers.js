import DeliveryAssignment from "../models/deliveryAssignmentModel.js";
import Order from "../models/orderModel.js";
import Shop from "../models/shopModel.js";
import User from "../models/userModel.js";



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

        const newOrder = await Order.create({  //create the new  order with all the details
            user: req.userId,
            paymentMethod,
            deliveryAddress: address,
            totalAmount: totalCartAmount,
            shopOrders
        })

        await newOrder.populate("shopOrders.shopOrderItems.item", "image name price");
        await newOrder.populate("shopOrders.shop", "name");

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



//? get all orders of logged in user (both user and owner)
export const getMyOrders = async (req, res) => {

    try {

        const user = await User.findById(req.userId);

        if (user.role == "user") {
            const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("shopOrders.owner", "name email mobile")
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
                status: { $nin: ["pending", "preparing", "delivered"] }
            }).distinct("assignedTo");  //here the logic is we find all delivery assignments whose assignedTo is in nearByDBids array and status is not pending ,preparing or delivered means they are busy in some delivery assignment and we get the distinct assignedTo ids from the found delivery assignments.Note normal find return the whole DeliveryAssignment data but we only need the delivery boys ids so distinct("assignedTo"); give us the  returned  ids which are filtered by {$in: nearByDBids},

            const busyIdsSet = new Set(busyDBids.map((id) => String(id)))  //here we basically make a set using our busyDBids . Its just for effecienty (basically if there is any duplicate id then set removes the duplicate)

            const availableDeliveryBoys = nearByDeliveryBoys.filter(db => !busyIdsSet.has(String(db._id))); //here we filter the nearByDeliveryBoys whose id is not in busyIdsSet means they are available for delivery

            //now we have all the delivery boys ids who are available and near 5 km
            const availableDeliveryBoysIds = availableDeliveryBoys.map(db => db._id);

            if (availableDeliveryBoysIds.length == 0) {
                await order.save();
                return res.json({ message: "Order status is Saved but there is no avaliable delivery boys" })
            }

            //create a delivery assignment for this shop order
            const newDeliveryAssignment = await DeliveryAssignment.create({
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


        await order.populate("shopOrders.shop", "name")
        await order.populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")

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
            status: { $nin: ["brodcasted", "assigned"] }
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