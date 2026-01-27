import Order from "../models/orderModel.js";
import Shop from "../models/shopModel.js";
import User from "../models/userModel.js";

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
            const shopId = item.shop; //we store the current item shop id in shopId variable

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


            const orders = await Order.find({ "shopOrders.owner": req.userId }).sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("user", "fullName email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")

            return res.status(200).json(orders);
        }




    } catch (error) {
        return res.status(500).json({ message: "Error while fetch orders", error });
    }
}