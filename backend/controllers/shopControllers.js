import Shop from "../models/shopModel.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

//create and edit shop controller
export const createAndEditShop = async (req, res) => {
    try {
        const { name, city, state, address } = req.body;

        let image;
        if (req.file) {  //the image which we send from frontend stored in req.file
            image = await uploadOnCloudinary(req.file.path) //we pass the file to our cloudinary fun to get the url link
        }

        let shop = await Shop.findOne({ owner: req.userId })

        //if we cant find owner in the Shop model means this is for creating the shop 
        //?create process
        if (!shop) {
            shop = new Shop({
                name,
                image,
                owner: req.userId, //when we define rout for this controller then we use isAuth middleware to get login user userId in req.userId
                city,
                state,
                address
            })
            await shop.save();
        }
        //if we can find owner in the Shop model means this is for update the shop 
        //?update process
        else {
            shop = await Shop.findByIdAndUpdate(shop._id, {
                name,
                image,
                owner: req.userId,
                city,
                state,
                address
            }, { new: true })
        }


        await shop.populate("owner");  //populate owner field
        return res.status(201).json(shop);  //return the shop


    } catch (error) {
        return res.status(500).json({ message: "Error in createAndEditShop function under shopControllers.js", error });
    }
}


//get current user shop

export const getMyShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId });
        await shop.populate("owner");
        await shop.populate('items');

        if (!shop) {
            return res.status(400).json({ message: "Error shop not found ! on getMyShop controller" });
        }

        return res.status(200).json(shop);
    } catch (error) {
        return res.status(500).json({ message: "Error in getMyShop controller !", error });
    }
}