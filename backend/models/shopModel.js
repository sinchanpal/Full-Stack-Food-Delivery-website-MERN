import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId, //type: mongoose.Schema.Types.ObjectId: This tells MongoDB: "Don't save the whole user here. Just save their unique ID card number (that weird string like 64f8a...)."

        ref: "User" //ref: "User": This is the Magic Link. It tells Mongoose: "If I ever ask you for the details of this ID, please go look inside the User collection to find them."
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }]  //this is a array cause multiple Items can sell by a particular shop
}, { timestamps: true });

const Shop = mongoose.model("Shop", shopSchema);
export default Shop;