//? Basically we have to find current user who is login so in this middleware we find userId using the token which is store in our cookie in browser after find the current user userId we return it and in controller folder we give this userId to a userController and then fetch all the current user details.

import jwt from "jsonwebtoken"
const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(400).json({ message: "Token not found ! " });

        }

        const decodeToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if(!decodeToken){
            return res.status(400).json({ message: "Token not verify ! " });
        }

        // console.log(decodeToken);
        req.userId = decodeToken.userId; //basically decodeToken return a object and under that we have userId key where we found user id who create the token
        next();
    } catch (error) {
        return res.status(400).json({ message: "Error in isAuth Middleware ! ", error });
    }
}

export default isAuth