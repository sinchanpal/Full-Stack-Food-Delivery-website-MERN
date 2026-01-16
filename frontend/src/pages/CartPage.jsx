import React from 'react'
import { IoMdArrowRoundBack } from "react-icons/io";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartItemCard from '../components/CartItemCard';
import { FaOpencart } from "react-icons/fa";


//TODO check this file
const CartPage = () => {

    const navigate = useNavigate();
    const { cartItems, totalCartAmount } = useSelector(state => state.user);
    return (
        <div className='min-h-screen bg-[#fff9f6] flex justify-center p-6'>
            <div className='w-full max-w-[800px]'>
                <div className='flex items-center gap-5 mb-6'>
                    <div className='absolute top-5 left-5 z-10 mb-2'>

                        {/* Back Button on click we navigate to home page */}
                        <IoMdArrowRoundBack size={45} className='text-[#ff4d2d] cursor-pointer' onClick={() => navigate('/')} />
                    </div>
                    <h1 className='text-2xl font-bold'>Your Cart </h1>
                    <FaOpencart className='text-[#ff4d2d]' size={35} />
                </div>

                {cartItems.length == 0 ? (
                    <p className='text-gray-500 text-lg text-center'>Your Cart is Empty</p>
                ) : (
                    <>
                        <div className='space-y-4'>
                            {cartItems.map((item, index) => (
                                <CartItemCard data={item} key={index} />
                            ))}
                        </div>

                        <div className='mt-6 bg-white p-4 rounded-xl shadow flex justify-between items-center border'>
                            <h1 className='text-lg font-semibold text-emerald-700'>Total Amount</h1>
                            <span className='text-xl font-bold text-[#ff4d2d]'>₹{totalCartAmount}</span>
                        </div>

                        <div className='mt-4 flex justify-end'>
                            <button className='bg-[#ff4d2d] text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-[#e64526] transition cursor-pointer'>Proceed to Checkout</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default CartPage
