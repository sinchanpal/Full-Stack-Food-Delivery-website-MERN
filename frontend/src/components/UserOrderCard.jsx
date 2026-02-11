import React from 'react'
import { useNavigate } from 'react-router-dom'

const UserOrderCard = ({ data }) => {

    const navigate=useNavigate();
    return (
        <div className='bg-white rounded-lg shadow p-4 space-y-4'>
            <div className='flex justify-between border-b pb-2'>

                <div>
                    {/* Take only last 6 characters of order id for display */}
                    <p className='font-semibold'>Order #{data?._id.slice(-6)}</p>
                    <p className='text-sm text-gray-700'>Date: {data?.createdAt.slice(0, 10)}</p>
                </div>

                <div className='text-right'>
                    <p className='text-sm text-gray-800'>{data?.paymentMethod?.toUpperCase()}</p>
                    {/* <p className='font-medium text-blue-500'>{data?.shopOrders[0]?.status}</p> */}
                </div>

            </div>


            {/* map and display each different shop order inside the particular one user order */}
            {data?.shopOrders.map((shopOrder, index) => (
                <div className='border rounded-lg p-3 bg-[#fffaf7] space-y-3' key={index}>
                    <p>{shopOrder?.shop?.name}</p>

                    <div className='flex space-x-4 overflow-x-auto pb-2'>

                        {/* map and display each ordered item inside particular shop order */}
                        {shopOrder?.shopOrderItems.map((shopItem, idx) => (
                            <div key={idx} className='shrink-0 w-40 border rounded-lg p-2 bg-white'>
                                <img src={shopItem?.item?.image} alt={shopItem?.item?.name} className='w-full h-24 object-cover rounded' />
                                <p className='text-sm font-semibold mt-1'>{shopItem?.item?.name}</p>
                                <p>₹{shopItem?.item?.price} X {shopItem?.quantity}  </p>
                            </div>
                        ))}
                    </div>

                    {/* display subtotal for particular shop order */}
                    <div className='flex justify-between items-center border-t pt-2'>
                        <p className='font-semibold'>Subtotal: {shopOrder?.subTotal}</p>
                        <p className='font-medium text-blue-500'>{shopOrder?.status}</p>
                    </div>
                </div>
            ))}

            {/* display total amount and track order btn */}
            <div className='flex justify-between items-center border-t pt-2'>
                <p className='font-bold text-lg'>Total Amount : <span className='text-green-700'>₹{data?.totalAmount}</span> </p>
                <button className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm' onClick={() => navigate(`/track-customer-order/${data._id}`)}>Track Order</button>
            </div>
        </div>
    )
}

export default UserOrderCard
