import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serverUrl } from '../App';
import { IoMdArrowRoundBack } from "react-icons/io";
import DeliveryBoyTracking from '../components/DeliveryBoyTracking';

const TrackCustomerOrder = () => {

    const { orderId } = useParams();
    const navigate = useNavigate();
    const [currentTrackedOrder, setCurrentTrackedOrder] = useState();

    const handleGetOrderById = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/get-order-by-id/${orderId}`, { withCredentials: true });
            setCurrentTrackedOrder(result?.data);
            console.log(result?.data);
        } catch (error) {
            console.log("Error in TrackCustomerOrder", error);
        }
    }

    useEffect(() => {
        handleGetOrderById();
    }, [orderId])

    return (
        <div className='max-w-4xl mx-auto p-4 flex flex-col gap-6'>

            <div className='relative top-5 left-5 z-10 mb-2 flex items-center gap-4'>

                {/* Back Button on click we navigate to home page */}
                <IoMdArrowRoundBack size={45} className='text-[#ff4d2d] cursor-pointer' onClick={() => navigate('/my-orders')} />
                <h1 className='text-2xl font-bold md:text-center'>Track Order</h1>

            </div>

            {currentTrackedOrder?.shopOrders?.map((shopOrder, index) => (
                <>
                    <div className='bg-white p-4 rounded-2xl shadow-md border border-orange-100 space-y-4 w-full' key={index}>
                        <p className='text-lg font-bold mb-2 text-[#ff4d2d]'>Shop Name : {shopOrder?.shop?.name}</p>
                        <p className='font-semibold text-gray-600'>Ordered Items : {shopOrder?.shopOrderItems?.map((item) => item.name).join(",")}</p>
                        <p className='font-semibold text-gray-600'>SubTotal : {shopOrder?.subTotal}</p>
                        <p className='font-semibold text-gray-600'>Delivery Address : {currentTrackedOrder?.deliveryAddress?.text}</p>



                        {shopOrder.status != "delivered" ? <>

                            {shopOrder?.assignedDeliveryBoy ?
                                <div className='text-sm text-gray-700'>

                                    {/* Delivery Boy details section */}
                                    <h2 className='font-semibold text-[#ff4d2d] text-lg'>Delivery Boy :</h2>
                                    <p className='font-semibold text-gray-600'>Assigned Delivery Boy: Name- <span className='text-[#ff4d2d]'>{shopOrder.assignedDeliveryBoy.fullName}</span> | Mobile- <span className='text-[#ff4d2d]'>{shopOrder.assignedDeliveryBoy.mobile}</span> </p>

                                    {/* Map Section */}
                                    {/* If there is any delivery boy assigned for this order and status is not delivered then we show this Map also for map we use our DeliveryBoyTracking component and we organize our data like object in object and pass it so that the DeliveryBoyTracking component use the required values like delivery boy lat lon  */}
                                    {shopOrder?.assignedDeliveryBoy && shopOrder?.status != "delivered" &&
                                        <div className='h-[400px] w-full rounded-2xl overflow-hidden shadow-md'>
                                            <DeliveryBoyTracking data={
                                                {
                                                    deliveryBoyLocation: {
                                                        lat: shopOrder?.assignedDeliveryBoy?.location?.coordinates?.[1],
                                                        lon: shopOrder?.assignedDeliveryBoy?.location?.coordinates?.[0]
                                                    },
                                                    customerLocation: {
                                                        lat: currentTrackedOrder?.deliveryAddress?.latitude,
                                                        lon: currentTrackedOrder?.deliveryAddress?.longitude
                                                    }
                                                }
                                            } />
                                        </div>}

                                </div> : <p className='font-semibold text-blue-600'>Delivery Boy is not assigned yet</p>}

                        </>
                            : <p className='font-bold text-green-600'>Order Delivered</p>}



                    </div>


                </>
            ))}

        </div>
    )
}

export default TrackCustomerOrder
