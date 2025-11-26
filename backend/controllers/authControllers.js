import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/createToken.js";


//signup logic
export const signup = async (req, res) => {
    try {
        const { fullName, email, password, mobile, role } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exist !" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be greater than 6 character !" });
        }
        if (mobile.length < 10) {
            return res.status(400).json({ message: "Phone number must be 10 digits !" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            mobile,
            role
        })
        await newUser.save();

        const token = genToken(newUser._id);
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,  //7 day in milisecond
            httpOnly: true
        })

        // Send Final Response
        // We don't send the password back to the frontend for security
        return res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            role: newUser.role,
            message: "User created successfully"
        });
    } catch (error) {
        console.log(error); // Log error to console so you can see it
        return res.status(500).json({ message: "Error in Signup logic" });
    }
}

//signin logic
export const signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(400).json({ message: "User does not exist !" });
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Password is incorrect !" });
        }



        const token = genToken(existingUser._id);
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,  //7 day in milisecond
            httpOnly: true
        })

        // Send Final Response
        // We don't send the password back to the frontend for security
        return res.status(200).json({
            _id: existingUser._id,
            fullName: existingUser.fullName,
            email: existingUser.email,
            role: existingUser.role,
            message: "User signin successfully"
        });
    } catch (error) {
        console.log(error); // Log error to console so you can see it
        return res.status(500).json({ message: "Error in Signin logic" });
    }
}

//signout logic
export const signout = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ message: "User signout successfully" })
    } catch (error) {
        console.log(error); // Log error to console so you can see it
        return res.status(500).json({ message: "Error in Signout logic" });
    }
}

