import Item from "../models/itemModel.js";
import Shop from "../models/shopModel.js";
import uploadOnCloudinary from "../utils/cloudinary.js";


//? add a item to shop
export const addItem = async (req, res) => {
    try {
        const { name, category, price, foodType } = req.body;
        let image;

        if (req.file) { //means if our multer access any file upload it on cloudinary
            image = await uploadOnCloudinary(req.file.path);
        }

        const shop = await Shop.findOne({ owner: req.userId }); //we find the shop of that owner (Logged in user)

        if (!shop) {
            return res.status(400).json({ message: "Error in addItem ! shop not found . " });
        }

        const item = new Item({ //if shop found create a item
            name,
            image,
            shop: shop._id,
            category,
            price,
            foodType
        })

        await item.save();

        //? Use 'unshift' to put the new item at the START of the array. Means latest item will come first
        shop.items.unshift(item._id); //after creating item we unshift that item to shop's item array
        await shop.save();
        await shop.populate('items');
        await shop.populate('owner');

        return res.status(201).json(shop);  //finally our shop is updated with new item and we return the updated shop
    } catch (error) {
        return res.status(500).json({ message: "Error in addItem function in itemControllers.js! ", error });
    }
}

//? edit item details
export const editItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;

        const { name, category, price, foodType } = req.body;
        let image;

        if (req.file) { //means if our multer access any file upload it on cloudinary
            image = await uploadOnCloudinary(req.file.path);
        }

        const item = await Item.findByIdAndUpdate(itemId, {
            name, image, category, price, foodType
        }, { new: true });

        if (!item) {
            return res.status(400).json({ message: "Error in editItem ! shop not found . " });
        }

        const shop = await Shop.findOne({ owner: req.userId });
        await shop.populate('items');
        await shop.populate('owner');

        return res.status(201).json(shop); //finally our shop is updated with edited item and we return the updated shop

    } catch (error) {
        return res.status(500).json({ message: "Error in editItem function in itemControllers.js! ", error });
    }
}


//? get a particular item by its id
export const getAParticularItemById = async (req, res) => {
    try {
        const itemId = req.params.itemId;

        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(400).json({ message: "Error in getAParticularItemById ! item not found . " });
        }

        return res.status(200).json(item);
    } catch (error) {
        return res.status(500).json({ message: "Error in getAParticularItemById function in itemControllers.js! ", error });
    }
}

//? delete item from shop
export const deleteItem = async (req, res) => { //Todo I have to check this deleteItem function later
    try {
        const itemId = req.params.itemId;
        const item = await Item.findByIdAndDelete(itemId);

        if (!item) {
            return res.status(400).json({ message: "Error in deleteItem ! item not found ." });

        }
        const shop = await Shop.findOne({ owner: req.userId });

        // This searches the array for this specific ID and removes it
        shop.items.pull(itemId); //we delete the item id from shop's item array though we have already deleted the item from Item collection cause The Item Collection is the Bookshelf. This is where the actual physical books (Pizza, Burger) sit.And The Shop Collection is the Catalog Card. This is just a list of names or ID numbers telling you what books the library owns. 

        await shop.save();
        await shop.populate('items');
        await shop.populate('owner');

        return res.status(200).json(shop);
    } catch (error) {
        return res.status(500).json({ message: "Error in deleteItem function in itemControllers.js ! ", error });
    }
}