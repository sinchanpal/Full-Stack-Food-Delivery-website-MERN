import React from 'react'
import { useSelector } from 'react-redux'
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';

const MyOrders = () => {

    const { userData, myOrders } = useSelector(state => state.user);
    const navigate = useNavigate();
    return (
        <div className='w-full min-h-screen bg-[#fff9f6] flex justify-center px-4'>
            <div className='w-full max-w-[800px] p-4'>

                <div className='flex items-center gap-5 mb-6'>
                    <div className='absolute top-5 left-5 z-10 mb-2'>

                        {/* Back Button on click we navigate to home page */}
                        <IoMdArrowRoundBack size={45} className='text-[#ff4d2d] cursor-pointer' onClick={() => navigate('/')} />
                    </div>
                    <h1 className='text-2xl font-bold'>My Orders </h1>

                </div>

                <div className='space-y-6'>
                    {myOrders?.map((order, index) => (

                        userData.role == "user" ? (  //if role is user then show all user orders
                            <UserOrderCard data={order} key={index} />
                        ) :

                            userData.role == "owner" ? (  //if role is owner then show all owner shop orders
                                <OwnerOrderCard data={order} key={index} />
                            ) :
                                null  // else show nothing
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MyOrders
