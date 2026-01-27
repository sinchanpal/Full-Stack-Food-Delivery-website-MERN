import React from 'react'
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const OrderPlaced = () => {

    const navigate = useNavigate();
    return (
        <div className='min-h-screen bg-[#fff9f6] flex flex-col justify-center items-center px-4 text-center relative overflow-hidden'>
            <FaCheckCircle className='text-green-500 text-6xl mb-4' />
            <h1 className='text-3xl font-bold text-gray-800'>Order Placed Successfully!</h1>
            <p className='text-gray-600 mt-2 max-w-md'>Thank you for your order. We're preparing it now!
                you can track your order status in the "My Orders" Section</p>

            <button className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-6 py-3 rounded-lg text-lg font-medium transition mt-4' onClick={() => navigate('/my-orders')}>Back to my orders</button>
        </div>
    )
}

export default OrderPlaced
