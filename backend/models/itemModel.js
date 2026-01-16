import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,  //shop link: Every food item belongs to a specific shop (e.g., "Chicken Pizza" belongs to "Pizza Hut"). so here we store the specific shopId to get all the details
        ref: "Shop"
    },
    category: {
        type: String,
        enum: [
            "Snacks",
            "Main Course",
            "Biryani",
            "Pizza",
            "Burger",
            "Rolls",
            "Chinese",
            "South Indian",
            "North Indian",
            "Momos",
            "Dessert",
            "Drinks"
        ],
        required: true
    },
    price: {
        type: Number,
        min: 0,
        required: true
    },
    foodType: {
        type: String,
        enum: [
            "veg",
            "non veg"
        ],
        required: true
    },
    rating: {
        average: { type: Number, default: 0 }, //average rating of the number of ratings
        count: { type: Number, default: 0 }  //total number of ratings recieved for this item
    }
})

const Item = mongoose.model("Item", itemSchema);
export default Item;