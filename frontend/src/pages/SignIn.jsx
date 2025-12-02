import axios from 'axios';
import React, { useState } from 'react'
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';

const SignIn = () => {

  const serverUrl = "http://localhost:8000"
  const navigate = useNavigate();

  //some usefull colors
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  //useStates for control values
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");



  const handelSignIn = async () => {
    try {
      const result = await axios.post(`${serverUrl}/api/auth/signin`, {
        email, password
      }, { withCredentials: true });

      console.log("Successfully Sign In . ", result);

      setEmail("");
      setPassword("");

    } catch (error) {
      console.log("Error while SignIn : ", error)
    }
  }


  return (
    <div className='min-h-screen w-full flex items-center justify-center p-4' style={{ backgroundColor: bgColor }}>
      <div className='bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-2' style={{ border: `1px solid ${borderColor}` }}>
        <h1 className='text-3xl font-bold mb-2' style={{ color: primaryColor }}>Vingo</h1>
        <p className='text-gray-600 mb-8'>Signin to your account to get started with delicious food deliveries</p>


        {/* email input */}
        <div className='mb-4'>
          <label htmlFor='email' className='block text-gray-700 font-medium mb-1'>Email</label>
          <input type='email' className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500' placeholder='Enter your email' style={{ border: `1px solid ${borderColor}` }} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>


        {/* password input */}
        <div className='mb-4'>
          <label htmlFor='password' className='block text-gray-700 font-medium mb-1'>Password</label>

          <div className='relative'>
            <input type={showPassword ? "text" : "password"} className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500' placeholder='Enter your password' style={{ border: `1px solid ${borderColor}` }} value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className='absolute right-3 cursor-pointer top-3.5 text-gray-500' onClick={() => setShowPassword(prev => !prev)}>{!showPassword ? <FaEye /> : <FaEyeSlash />}</button>
          </div>
        </div>

        {/* forgot password */}
        <div className='text-right text-[#ff4d2d] font-medium mb-4 cursor-pointer' onClick={()=>navigate("/forgot-password")}>
          Forgot Password
        </div>


        {/* SignIn Button */}
        <button className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] hover:bg-[#e64323] text-white cursor-pointer`} onClick={handelSignIn}>
          Sign In
        </button>

        <div className='w-full mt-1 text-center font-medium'>Or</div>

        {/* SignIn with google */}
        <button className='w-full mt-1 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 border-gray-400 hover:bg-gray-200 cursor-pointer'>
          <FcGoogle size={20} />
          <span>Sign In with Google</span>
        </button>

        {/* Dont have an account signup */}
        <p className='text-center mt-2'>Don't have an account ? <span className='text-[#ff4d2d] font-medium cursor-pointer' onClick={() => navigate('/signup')}>Sign Up</span></p>

      </div>

    </div>
  )
}

export default SignIn

