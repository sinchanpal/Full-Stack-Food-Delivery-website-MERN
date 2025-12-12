import React, { useState } from 'react'
import { FaLocationDot } from "react-icons/fa6";
import { IoSearchOutline } from "react-icons/io5";
import { FaCartPlus } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setUserData } from '../redux/userSlice';
import { serverUrl } from '../App';

const Nav = () => {

    const dispatch = useDispatch();

    const [showInfo, setShowInfo] = useState(false);
    const [showSearch, setShowSearch] = useState(false)
    const { userData, userCity } = useSelector(state => state.user);

    const handleLogout = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true });
            dispatch(setUserData(null));
        } catch (error) {
            console.log("Error in logout logic in Nav.jsx! ", error);
        }
    }


    return (
        <div className='w-full h-20 flex items-center justify-between md:justify-center gap-[30px] px-5 fixed top-0 z-9999 bg-[#fff9f6] overflow-visible'>

            {/* This Search section is only for small screen if showSearch is true then show it other wise dont show it */}
            {showSearch &&
                <div className='w-[90%] h-[70px] bg-white shadow-xl rounded-lg flex fixed top-20 left-[5%] items-center gap-5 md:hidden'>
                    <div className='flex items-center w-[30%] overflow-hidden gap-2.5 px-2.5 border-r-2 border-gray-200'>
                        <FaLocationDot size={25} className='text-[#ff4d2d]' />
                        <div className='w-[80%] truncate text-gray-600'>{userCity}</div>
                    </div>
                    <div className='w-[80%] flex items-center gap-2.5'>
                        <IoSearchOutline size={25} className='text-[#ff4d2d]' />
                        <input type="text" placeholder='Search delicious foods...' className='px-2.5 text-gray-700 outline-0 w-full' />
                    </div>
                </div>}


            <h1 className='text-3xl font-bold mb-2 text-[#ff4d2d]'>Vingo</h1>

            {/* Search food section */}
            <div className='md:w-[60%] lg:w-[40%] h-[70px] bg-white shadow-xl rounded-lg hidden md:flex items-center gap-5'>
                <div className='flex items-center w-[30%] overflow-hidden gap-2.5 px-2.5 border-r-2 border-gray-200'>
                    <FaLocationDot size={25} className='text-[#ff4d2d]' />
                    <div className='w-[80%] truncate text-gray-600'>{userCity}</div>
                </div>
                <div className='w-[80%] flex items-center gap-2.5'>
                    <IoSearchOutline size={25} className='text-[#ff4d2d]' />
                    <input type="text" placeholder='Search delicious foods...' className='px-2.5 text-gray-700 outline-0 w-full' />
                </div>
            </div>

            <div className='flex items-center gap-4'>

                {/* we only show this search button on sm screen */}
                {showSearch ? <RxCross1 size={25} className='text-[#ff4d2d] md:hidden' onClick={() => setShowSearch(false)} /> : <IoSearchOutline size={25} className='text-[#ff4d2d] md:hidden' onClick={() => setShowSearch(true)} />}



                {/* Cart section */}
                <div className='relative cursor-pointer'>
                    <FaCartPlus size={25} className='text-[#ff4d2d]' />
                    <span className='absolute right-[-9px] -top-3 text-[#ff4d2d] '>0</span>
                </div>

                {/* my order button */}
                <button className='hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium cursor-pointer'>My Orders</button>

                {/* Profile button */}
                <div className='w-10 h-10 rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[18px] shadow-xl font-semibold cursor-pointer' onClick={() => setShowInfo(prev => !prev)}>
                    {/* here we just need 1st letter of our full name so slice(0,1) */}
                    {userData?.fullName.slice(0, 1)}
                </div>

                {/*if click on profile logo then show a Pop Up with some information  */}
                {showInfo && <div className='fixed top-20 right-2.5 md:right-[10%] lg:right-[25%] w-[180px] bg-white shadow-2xl rounded-xl p-5 flex flex-col gap-2.5 z-9999'>
                    <div className='text-[17px] font-semibold'>{userData.fullName}</div>
                    <div className='md:hidden text-[#ff4d2d] font-semibold cursor-pointer'>My Orders</div>
                    <div className='text-[#ff4d2d] font-semibold cursor-pointer' onClick={handleLogout}>Log Out</div>
                </div>}


            </div>
        </div>
    )
}

export default Nav
