import React, { useState } from 'react'
import { FaLocationDot } from "react-icons/fa6";
import { IoSearchOutline } from "react-icons/io5";
import { FaCartPlus } from "react-icons/fa";
import { HiPlus } from "react-icons/hi";
import { RxCross1 } from "react-icons/rx";
import { IoReceiptOutline } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setUserData } from '../redux/userSlice';
import { serverUrl } from '../App';
import { useNavigate } from 'react-router-dom';

const Nav = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [showInfo, setShowInfo] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    const { userData, userCity, cartItems } = useSelector(state => state.user);
    const { myShopData } = useSelector(state => state.owner);


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

            <div className='w-full max-w-5xl flex items-center justify-between gap-[30px]'>


                {/* This Search section is only for small screen if showSearch is true and userData role is "user" then show it other wise dont show it */}
                {showSearch && userData.role == "user" &&
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

                {/* Search food section show this search section if userData role is "user"*/}

                {userData.role == "user" &&
                    <div className='md:w-[60%] lg:w-[60%] h-[70px] bg-white shadow-xl rounded-lg hidden md:flex items-center gap-5'>
                        <div className='flex items-center w-[30%] overflow-hidden gap-2.5 px-2.5 border-r-2 border-gray-200'>
                            <FaLocationDot size={25} className='text-[#ff4d2d]' />
                            <div className='w-[80%] truncate text-gray-600'>{userCity}</div>
                        </div>
                        <div className='w-[80%] flex items-center gap-2.5'>
                            <IoSearchOutline size={25} className='text-[#ff4d2d]' />
                            <input type="text" placeholder='Search delicious foods...' className='px-2.5 text-gray-700 outline-0 w-full' />
                        </div>
                    </div>}


                <div className='flex items-center gap-4'>

                    {/* we only show this search button on sm screen and if userData role is equal to "user"*/}
                    {userData.role == "user" &&
                        (showSearch ? <RxCross1 size={25} className='text-[#ff4d2d] md:hidden' onClick={() => setShowSearch(false)} /> : <IoSearchOutline size={25} className='text-[#ff4d2d] md:hidden' onClick={() => setShowSearch(true)} />)}



                    {userData.role == "owner" ?
                        // If role is owner then show the bellow content
                        (<>
                            {/* if myShopData is found then show add food Item button */}
                            {myShopData &&

                                <>
                                    {/* on Click this button we navigate to add item page */}
                                    <button className='hidden md:flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]' onClick={() => navigate('/add-item')}>
                                        <HiPlus size={20} />
                                        <span>Add Food Item</span>
                                    </button>

                                    <button className='md:hidden flex items-center  p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]'>
                                        <HiPlus size={20} />
                                    </button>
                                </>}


                            {/* my order button for owner*/}

                            <div className='hidden md:flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium'>
                                <IoReceiptOutline size={20} />
                                <span className='absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-1.5 py-px '>0</span>
                                <span>My Orders</span>
                            </div>

                            {/* on small devices show only receipt icon */}
                            <div className='md:hidden flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium'>
                                <IoReceiptOutline size={20} />
                                <span className='absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-1.5 py-px '>0</span>
                            </div>

                        </>) :
                        // If role is user then show the bellow content
                        (<>
                            {/* Cart section show this cart section if userData role is "user" */}
                            <div className='relative cursor-pointer' onClick={() => navigate('/cart')}>
                                <FaCartPlus size={25} className='text-[#ff4d2d]' />
                                <span className='absolute right-[-9px] -top-3 text-[#ff4d2d] '>{cartItems.length}</span>
                                {/* here by cartItems.length we show how many diff food item added to our cart */}
                            </div>

                            {/* my order button */}
                            <button className='hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium cursor-pointer'>
                                My Orders
                            </button>
                        </>)}




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


        </div>
    )
}

export default Nav
