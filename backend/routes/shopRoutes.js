import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { createAndEditShop, getMyShop } from "../controllers/shopControllers.js";
import { upload } from "../middlewares/multer.js";



const shopRouter = express.Router();


shopRouter.post('/create-edit-shop', isAuth, upload.single("image"), createAndEditShop); //upload.single("image") this is our multer middleware here we send a single image at a time so we type .single and from frontend we send the image as image name so we write ("image")

shopRouter.get('/get-my-shop',isAuth,getMyShop);  //get the userId from isAuth middleware then call getMyShop to get current user shop


export default shopRouter;