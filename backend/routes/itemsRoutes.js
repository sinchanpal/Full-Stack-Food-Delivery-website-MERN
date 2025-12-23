import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { addItem, deleteItem, editItem, getAParticularItemById } from "../controllers/itemControllers.js";
import { upload } from "../middlewares/multer.js";




const itemRouter = express.Router();


itemRouter.post('/add-item', isAuth, upload.single("image"), addItem);
itemRouter.post('/edit-item/:itemId', isAuth, upload.single("image"), editItem);
itemRouter.get('/get-particular-item/:itemId', isAuth, getAParticularItemById);
itemRouter.delete('/delete-item/:itemId', isAuth , deleteItem);


export default itemRouter;