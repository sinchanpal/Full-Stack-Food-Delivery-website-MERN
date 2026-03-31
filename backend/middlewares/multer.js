import multer from "multer";
import fs from "fs"; // Import Node's built-in file system module

// Check if the 'public' folder exists. If not, create it automatically!
const dir = './public';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => { // cb means callback
        cb(null, './public');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

export const upload = multer({ storage });



//! here basically our image storing process is we gave a image file from frontend then it comes to multer middleware then this middleware store the image to a destination folder ("/public") then after that we upload that image to cloudinary (using cloudinary.js) then cloudinary gives us a image url later we store this url to our Backend DB then we delete the file from the destination folder('/public') 