import mongoose from "mongoose"

const connectDB = async () =>{
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("MongoDB connected.")
    } catch (error) {
        console.log("Error while connect to MongoDB",error)
    }
}

export default connectDB;