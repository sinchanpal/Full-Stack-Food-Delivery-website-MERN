
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,                // <--- CHANGE FROM 465 to 587
    secure: false,            // <--- CHANGE FROM true to false (false means use STARTTLS)
    requireTLS: true,         // <--- ADD THIS LINE to force secure connection
    auth: {
        user: process.env.EMAIL,     // Read from .env
        pass: process.env.APP_PASS,  // Read from .env
    },
});

export const sendOtpMail = async (to, otp) => {

    const info = await transporter.sendMail({
        from: process.env.EMAIL, //send message from which email
        to,                              //get the message on which mail
        subject: "Reset Your Password",
        html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes</p>`, // HTML body
    });

    console.log("Message sent:", info.messageId);
}


export const sendDeliveryOtpMail = async (user, otp) => {

    const info = await transporter.sendMail({
        from: process.env.EMAIL, //send message from which email
        to: user.email,                              //get the message on which mail
        subject: "Delivery Confirmation OTP",
        html: `<p>Hi👋 ${user?.fullName} Your OTP for delivery Confirmation is <b>${otp}</b>. It expires in 5 minutes</p>`, // HTML body
    });

    console.log("Message sent:", info.messageId);
}