import mongoose from "mongoose";

const deliveryAssignment = new mongoose.Schema({

    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop"
    },
    shopOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    broadcastedTo: [  //here we will store the list of delivery persons to whom we have broadcasted this delivery assignment
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    assignedTo: {   //here we will store the delivery person to whom this delivery assignment is assigned
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    status: {   //status of delivery assignment
        type: String,
        enum: ["brodcasted", "assigned", "completed"],
        default: "brodcasted"
    },
    acceptedAt: {
        type: Date,
        default: null
    }



}, { timestamps: true })

const DeliveryAssignment = mongoose.model("DeliveryAssignment", deliveryAssignment);
export default DeliveryAssignment;