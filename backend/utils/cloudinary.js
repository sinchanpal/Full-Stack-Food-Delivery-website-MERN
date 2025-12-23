import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

const uploadOnCloudinary = async (file) => {



    // Configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
        api_key: process.env.CLOUDNARY_API_KEY,
        api_secret: process.env.CLOUDNARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    try {
        const result=await cloudinary.uploader.upload(file);
        fs.unlinkSync(file);  //unlinkSync function under fs module work is .It just delete the file from where it stored
        return result.secure_url; //after upload the file on cloudinary it gives us a url link of that file and we store this link to our DB
            
    } catch (error) {
        fs.unlinkSync(file);
        console.log("Error on uploadOnCloudinary : ",error);
    }


}

export default uploadOnCloudinary;

//! here basically our image storing process is we gave a image file from frontend then it comes to multer middleware then this middleware store the image to a destination folder ("/public") then after that we upload that image to cloudinary (using cloudinary.js) then cloudinary gives us a image url later we store this url to our Backend DB then we delete the file from the destination folder('/public') 