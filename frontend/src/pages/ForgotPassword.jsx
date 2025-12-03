import axios from 'axios';
import React, { useState } from 'react'
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

const ForgotPassword = () => {

    const serverUrl = "http://localhost:8000";

    //some usefull colors
    const primaryColor = "#ff4d2d";
    const hoverColor = "#e64323";
    const bgColor = "#fff9f6";
    const borderColor = "#ddd";

    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [err, SetErr] = useState('');
    const [loading, setLoading] = useState(false);

    const handelSendOtp = async () => {

        setLoading(true);
        try {
            const result = await axios.post(`${serverUrl}/api/auth/send-otp`, {
                email
            }, { withCredentials: true });
            console.log("Send otp result: ", result);
            SetErr("");
            setLoading(false);
            setStep(2);
        } catch (error) {
            SetErr(error?.response?.data?.message);
            setLoading(false);
            console.log("Error on handelSendOtp function : ", error);
        }
    }


    const handelvarifyOtp = async () => {
        setLoading(true);
        try {
            const result = await axios.post(`${serverUrl}/api/auth/verify-otp`, {
                email, otp
            }, { withCredentials: true });
            console.log("Verify otp result: ", result);
            SetErr("");
            setLoading(false);
            setStep(3);
        } catch (error) {
            SetErr(error?.response?.data?.message);
            setLoading(false);
            console.log("Error on handelvarifyOtp function : ", error);
        }
    }


    const handelresetPassword = async () => {

        setLoading(true);

        if (newPassword != confirmPassword) {

            SetErr("new password and confirm password must be same.");
            setLoading(false);
            return null;
        }
        try {
            const result = await axios.post(`${serverUrl}/api/auth/reset-password`, {
                email, newPassword
            }, { withCredentials: true });
            console.log("Reset Password result: ", result);
            SetErr("");
            setLoading(false);
            navigate("/signin");
        } catch (error) {
            SetErr(error?.response?.data?.message);
            setLoading(false);
            console.log("Error on handelresetPassword function : ", error);
        }
    }




    return (
        <div className='flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6]'>

            <div className='bg-white rounded-xl shadow-lg w-full max-w-md p-8 '>

                <div className='flex items-center gap-4 mb-4'>
                    <IoArrowBack size={30} className='text-[#ff4d2d] cursor-pointer' onClick={() => navigate('/signin')} />
                    <h1 className='text-2xl font-bold text-center text-[#ff4d2d]'>Forgot Password</h1>
                </div>


                {step == 1 && <div>
                    <div className='mb-4'>
                        <label htmlFor='email' className='block text-gray-700 font-medium mb-1'>Email</label>
                        <input type='email' className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500' placeholder='Enter your email' style={{ border: `1px solid ${borderColor}` }} value={email} onChange={(e) => setEmail(e.target.value)} />


                    </div>

                    <button className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] hover:bg-[#e64323] text-white cursor-pointer`} onClick={handelSendOtp} disabled={loading}>

                        {loading ? <ClipLoader size={20} color="white"/> : 'Send OTP'}

                    </button>
                    {err && <p className='text-red-600 text-center m-1.5 font-bold'>{`*${err}`}</p>}
                </div>


                }




                {step == 2 && <div>

                    <div className='mb-4'>
                        <label htmlFor='OTP' className='block text-gray-700 font-medium mb-1'>OTP</label>
                        <input type='text' className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500' placeholder='Enter your OTP' style={{ border: `1px solid ${borderColor}` }} value={otp} onChange={(e) => setOtp(e.target.value)} />


                    </div>

                    <button className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] hover:bg-[#e64323] text-white cursor-pointer`} onClick={handelvarifyOtp} disabled={loading}>

                        {loading ? <ClipLoader size={20} color="white"/> : 'Verify'}

                    </button>
                    {err && <p className='text-red-600 text-center m-1.5 font-bold'>{`*${err}`}</p>}
                </div>


                }


                {step == 3 && <div>

                    <div className='mb-4'>
                        <label htmlFor='newPassword' className='block text-gray-700 font-medium mb-1'>New Password</label>
                        <input type='text' className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500' placeholder='Enter your new password' style={{ border: `1px solid ${borderColor}` }} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />


                    </div>

                    <div className='mb-4'>
                        <label htmlFor='confirmPassword' className='block text-gray-700 font-medium mb-1'>Confirm Password</label>
                        <input type='text' className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500' placeholder='Confirm Password' style={{ border: `1px solid ${borderColor}` }} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />


                    </div>

                    <button className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] hover:bg-[#e64323] text-white cursor-pointer`} onClick={handelresetPassword} disabled={loading}>

                        {loading ? <ClipLoader size={20} color="white"/> : 'Change Password'}

                    </button>
                    {err && <p className='text-red-600 text-center m-1.5 font-bold'>{`*${err}`}</p>}
                </div>


                }



            </div>

        </div >
    )
}

export default ForgotPassword
