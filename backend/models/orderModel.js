import mongoose from "mongoose";

//?------ Level 3: The specific food items (e.g., "2x Margherita Pizza")
// This schema represents a single line item in the bill.
const shopOrderItemSchema = new mongoose.Schema({

    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },
    name: {        //This is the name of the item ordered by the user
        type: String,
        required: true
    },
    price: {
        type: Number,  // COMMENT: This is the price at the time of purchase. 
        // We store it here because the restaurant might change the menu price later, 
        // but this order's history should remain accurate.
        required: true
    },
    quantity: {
        type: Number,
        required: true
        // COMMENT: Example: If user buys 2 pizzas, quantity is 2.
    }

}, { timestamps: true });




//?------ Level 2: The "Ticket" for a specific Shop (e.g., "Order for Dominos")
// Since a user might order from Dominos AND Burger King at the same time,
// we need to group items by Shop so each restaurant knows what to cook.
const shopOrderSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop"
    },
    // OPTIONAL: Storing the shop owner's ID here helps you quickly find 
    // "All orders for this Restaurant Owner" without looking up the Shop model first.
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subTotal: {      // COMMENT: The total cost for THIS specific shop's items only.
        // Example: Pizza (150) + Garlic Bread (50) = 200 (Subtotal for Dominos).
        type: Number,
        required: true
    },
    shopOrderItems: [shopOrderItemSchema], // COMMENT: The list of food items specific to this one shop.
    status: {
        type: String,
        enum: ["pending", "preparing", "out-for-delivery", "delivered"],
        default: "pending"
    },
    orderAssignment: {   //here we will store the delivery assignment id  related to this shop order
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeliveryAssignment",
        default: null
    },
    assignedDeliveryBoy:{   //here we store the delivery boy data for this particular shopOrder
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
    
}, { timestamps: true });



//! Read from here
//?------ Level 1: The "Master Receipt" (User's Point of View)
// This is the main record of the transaction. The user pays ONE total amount,
// even if the food comes from 3 different shops.
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    paymentMethod: {
        type: String,
        enum: ["cod", "online"],
        required: true
    },
    deliveryAddress: {
        text: String,
        latitude: Number,
        longitude: Number
    },
    totalAmount: {
        type: Number,// COMMENT: The Grand Total user paid. 
        // Sum of all subTotals from the shops below.
        required: true
    },
    shopOrders: [shopOrderSchema]  // COMMENT: An array of shop orders.
    // Example: [ {Dominos Order}, {Burger King Order} ]
    // This allows you to split the order internally while the user sees just one "Order".
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;