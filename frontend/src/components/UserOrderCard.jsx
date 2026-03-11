import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaStar, FaRegStar } from "react-icons/fa";
import axios from 'axios';
import { serverUrl } from '../App';


//? 1. MINI COMPONENT: We create a small StarRating component just for handling the hover/click effects

//?----------------------------------------------------------------------------------------------------------

const StarRating = ({ itemId, onRate }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    const handleClick = (star) => {
        setRating(star); // Update the visual stars instantly
        onRate(itemId, star);   // Send the rating to the backend . onRate(itemId, star) is the exact same thing as running handleRateItem(itemId, star) back up inside the Parent component!
        alert(`You rated item ${itemId} with ${star} stars!`); // Optional: Show an alert or toast
    }

    return (
        <div className="flex items-center gap-1 mt-2 border-t pt-2">
            <span className="text-xs font-semibold text-gray-500 mr-1">Rate:</span>
            {
                [1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        className="cursor-pointer transition-transform hover:scale-125"
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                    >
                        {star <= (hoverRating || rating) ?
                            (<FaStar className="text-yellow-400 text-sm" />)
                            :
                            (<FaRegStar className="text-gray-300 text-sm" />)}

                    </button>
                ))
            }

        </div>
    )
}

//?---------------------------------------------------------------------------------------------------------




const UserOrderCard = ({ data }) => {

    const navigate = useNavigate();

    const handleRateItem =async (itemId , starValue) =>{
        try {
            const result = await axios.post(`${serverUrl}/api/item/rate-item`,{
                itemId,
                star: starValue
            }, {withCredentials: true});

            console.log("Rating successful:", result.data);
        } catch (error) {
            console.log("Error rating item:", error);
        }
    };


    return (
        <div className='bg-white rounded-lg shadow p-4 space-y-4'>
            <div className='flex justify-between border-b pb-2'>

                <div>
                    {/* Take only last 6 characters of order id for display */}
                    <p className='font-semibold'>Order #{data?._id.slice(-6)}</p>
                    <p className='text-sm text-gray-700'>Date: {data?.createdAt.slice(0, 10)}</p>
                </div>

                <div className='text-right'>
                    <p className='text-sm text-gray-800 font-medium'>{data?.paymentMethod?.toUpperCase()}</p>
                    {data?.paymentMethod === "online" && <p className={`font-semibold ${data?.payment == false ? "text-red-500" : "text-green-500"}`}>{data?.payment == false ? "Payment Pending" : "Payment Done✅"}</p>}
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

                                {/* 3. THE RATING RENDER: Only show stars if the food is delivered! */}
                                {shopOrder?.status === "delivered" && (
                                    <div className='mt-auto'>
                                        <StarRating
                                            itemId={shopItem?.item?._id}
                                            onRate={handleRateItem} //passing the entire function as a variable.
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* display subtotal for particular shop order */}
                    <div className='flex justify-between items-center border-t pt-2'>

                        <div className='flex items-start justify-center gap-1.5'>
                            <p className='font-semibold'>Subtotal: ₹{shopOrder?.subTotal} | </p>
                            <p className='font-medium text-blue-500'>Status: {shopOrder?.status}</p>
                        </div>


                        {shopOrder?.status !== "delivered" && <button className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm' onClick={() => navigate(`/track-customer-order/${data._id}`)}>Track Order</button>}

                    </div>
                </div>
            ))}

            {/* display total amount and track order btn */}
            <div className='flex justify-between items-center border-t pt-2'>
                <p className='font-bold text-lg'>Total Amount : <span className='text-green-700'>₹{data?.totalAmount}</span> </p>

            </div>
        </div>
    )
}

export default UserOrderCard
