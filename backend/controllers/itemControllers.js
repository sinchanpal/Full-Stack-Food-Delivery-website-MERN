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


//get all items from current user city shops
export const getAllItemsByCity = async (req, res) => {

    const { currCity } = req.params;
    try {

        // { $regex: currCity, $options: "i" } tells MongoDB to ignore capital/small letters
        const shops = await Shop.find({ city: { $regex: currCity.trim(), $options: "i" } });


        if (!shops || shops.length === 0) {
            return res.status(400).json({ message: "No Shops found in your City !" });
        }

        const allShopIds = shops?.map((shop) => shop._id);
        const allItems = await Item.find({ shop: { $in: allShopIds } }).populate('shop', 'name'); //we get all items whose shop id is in allShopIds array 

        if (!allItems) {
            return res.status(400).json({ message: "No Items found in your City !" });
        }

        return res.status(200).json(allItems);
    } catch (error) {
        return res.status(500).json({ message: "Error in getAllItemsByCity function in itemControllers.js !", error });
    }
}


export const getItemsBySearchBar = async (req, res) => {
    try {
        const { itemQuery, currCity } = req.query; //req.query is used when you send data visible in the URL (via a GET request). The URL looks like this: http://localhost:5000/api/search-items?itemQuery=pizza&currCity=Mumbai

        if (!itemQuery || !currCity) {
            return res.status(400).json({ message: "Search query and City are required!" });
        }

        // { $regex: currCity, $options: "i" } tells MongoDB to ignore capital/small letters
        //find all shops in current user City
        const shops = await Shop.find({ city: { $regex: currCity.trim(), $options: "i" } });

        if (!shops || shops.length === 0) {
            return res.status(404).json({ message: "No Shops found in your City !" });
        }

        //store all found shops shopIds in a variable
        const allShopIds = shops?.map((shop) => shop._id);

        //find the all items where its shop id present in allShopIds and  ($or) either user itemQuery matches the name or category. With $regex (Pattern Match):If I search for "Apple", I find anything containing that word."Green Apple" ✅ (Found!)
        const allItems = await Item.find({

            shop: { $in: allShopIds },

            $or: [
                { name: { $regex: itemQuery.trim(), $options: "i" } },
                { category: { $regex: itemQuery.trim(), $options: "i" } }
            ]

        }).populate('shop', 'name'); //we get all items whose shop id is in allShopIds array 

        if (allItems.length === 0) {
            return res.status(400).json({ message: "No Items found in your Query !" });
        }

        return res.status(200).json(allItems);

    } catch (error) {
        return res.status(500).json({ message: "Error in getItemsBySearchBar function in itemControllers.js !", error });
    }
}

//?When a user clicks a star (say, 4 stars) on the frontend, this controller will receive that number, find the item, check if the user already rated it, and recalculate the overall average.
export const rateItem = async (req, res) => {
    try {
        const { itemId, star } = req.body;
        const userId = req.userId;

        if (!star || star < 1 || star > 5) {
            return res.status(400).json({ message: "Please provide a valid rating between 1 and 5." });
        }

        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).json({ message: "Item not found!" });
        }

        // 1. Check if this specific user has already rated this item
        const existingRatingIndex = item.reviews.findIndex(review => review.user.toString() === userId);

        if (existingRatingIndex !== -1) {
            // User already rated it! Update their existing star rating.
            item.reviews[existingRatingIndex].star = star;
        } else {
            // New rating! Add it to the reviews array and increase the total count.
            item.reviews.push({ user: userId, star });
            item.rating.count = item.reviews.length;
        }

        // 2. Recalculate the overall Average Rating
        // We sum up all the stars in the reviews array...
        const totalStars = item.reviews.reduce((sum, review) => sum + review.star, 0);

        item.rating.average = Number((totalStars / item.reviews.length).toFixed(2)); //...and divide by the total number of ratings to get the new average. We also use toFixed(2) to round it to 2 decimal places.

        // 3. Save the updated item
        await item.save();

        item.populate('shop', 'name'); //we populate the shop field with shop name to send it in response   

        return res.status(200).json(item);

    } catch (error) {
        return res.status(500).json({ message: "Error in rateItem function!", error });
    }
}