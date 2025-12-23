import User from "../models/userModel.js";

//get current user controller
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ message: "User Id is not found !" });
        }
        const currUser = await User.findById(userId);

        if (!currUser) {
            return res.status(400).json({ message: "User is not found !" });
        }
        return res.status(200).json({ message: "User found.", currUser })
    } catch (error) {
        return res.status(500).json({ message: "Error in getCurrentUser !", error });
    }
}