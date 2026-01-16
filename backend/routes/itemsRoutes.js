import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { addItem, deleteItem, editItem, getAllItemsByCity, getAParticularItemById } from "../controllers/itemControllers.js";
import { upload } from "../middlewares/multer.js";




const itemRouter = express.Router();


itemRouter.post('/add-item', isAuth, upload.single("image"), addItem);
itemRouter.post('/edit-item/:itemId', isAuth, upload.single("image"), editItem);
itemRouter.get('/get-particular-item/:itemId', isAuth, getAParticularItemById);
itemRouter.delete('/delete-item/:itemId', isAuth , deleteItem);
itemRouter.get('/get-all-items-in-city/:currCity', isAuth, getAllItemsByCity);


export default itemRouter;