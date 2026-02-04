import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,

    },
    mobile: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "owner", "deliveryBoy"],
        required: true
    },
    resetOtp: {
        type: String
    },
    isOtpVerified: {
        type: Boolean,
        default: false
    },
    otpExpires: {
        type: Date
    },
    location: {   //this is called GeoJson format . It is used to used to store location data in mongoDB
        type: {
            type: String,  //This define the type of geojson object we are storing. point is used to store a singe location
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {  //this will store the actual coordinates
            type: [Number], //always coordinates are in this order [longitude, latitude]
            default: [0, 0] //default both are 0
        }
    }


}, { timestamps: true });

userSchema.index({ location: "2dsphere" }); //this will tell mongoDB that treat location filed as GeoJson data(map data)

const User = mongoose.model("User", userSchema);
export default User;