import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/createToken.js";
import { sendOtpMail } from "../utils/sendMail.js";


//signup logic
export const signup = async (req, res) => {
    try {
        const { fullName, email, password, mobile, role } = req.body;
        let existingUser = await User.findOne({ email });

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
        let existingUser = await User.findOne({ email });

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


//send otp
export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: "User does not exist !" });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString(); //generate a otp
        user.resetOtp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        user.isOtpVerified = false; //for now we just send and store the otp on our DB so here we set Value as false.But after user enter the otp we compare entered otp with DB saved otp then we change the value as per requirment
        await user.save(); //save the data to DB

        await sendOtpMail(email, otp);
        return res.status(200).json({ message: "OTP send successfully" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error While send otp" });
    }
}


//verify otp

export const verifyOtp = async (req, res) => {

    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.resetOtp != otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid/Expired OTP" });
        }

        user.isOtpVerified = true;
        user.resetOtp = undefined;
        user.otpExpires = undefined;
        await user.save();
        return res.status(200).json({ message: "OTP verify successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Error in verify OTP", error });
    }
}


//reset the password

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user || !user.isOtpVerified) {
            return res.status(400).json({ message: "OTP verification required" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        user.isOtpVerified = false;

        await user.save();

        return res.status(200).json({ message: "password reset successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error in reset password", error });
    }
}


//handel google auth
export const googleAuth = async (req, res) => {
    try {
        const { fullName, email, mobile, role } = req.body;
        let user = await User.findOne({ email });

        // if !user then it means we have to create the user so we save the dada in our database then create token (Signup complete)
        if (!user) {
            user = new User({
                fullName,
                email,
                mobile,
                role
            })
            await user.save();
        }

        // if user already exist means we just create token (Signin complete)
        const token = genToken(user._id);
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,  //7 day in milisecond
            httpOnly: true
        })

        return res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            message: "successfully perform google auth"
        });
    } catch (error) {
        console.log(error); // Log error to console so you can see it
        return res.status(500).json({ message: "Error in googleAuth logic" });
    }
}

