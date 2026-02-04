import React, { useState } from 'react'
import { MdPhone } from "react-icons/md";
import { BiLogoGmail } from "react-icons/bi";
import axios from 'axios';
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { updateMyOrderStatus } from '../redux/userSlice';


//TODO I have to check this file later and understand it properly
const OwnerOrderCard = ({ data }) => {

  const [availableDeliveryBoys, setAvailableDeliveryBoys] = useState([]);
  const dispatch = useDispatch();
  const handleStatusChange = async (status) => {
    try {


      const result = await axios.post(`${serverUrl}/api/order/update-order-status`, {
        orderId: data?._id,
        shopOrderId: data?.shopOrders[0]?.shop?._id,
        status: status
      }, { withCredentials: true });

      console.log(result?.data);

      dispatch(updateMyOrderStatus({
        orderId: data?._id,
        shopOrderId: data?.shopOrders[0]?.shop?._id,
        status: status
      }));
      setAvailableDeliveryBoys(result?.data?.availableDeliveryBoys || []) //if there is no deliveryBoys available then here we set a empty array



    } catch (error) {
      console.log("Error in handleStatusChange", error);
    }
  }



  return (
    <div className='bg-white rounded-lg shadow p-4 space-y-4'>

      <div>
        <h2 className='text-lg font-semibold text-gray-800'>{data?.user?.fullName}</h2>
        <p className='flex items-center gap-2 text-sm mt-1'><BiLogoGmail /><span className='text-gray-500'>{data?.user?.email}</span></p>
        <p className='flex items-center gap-2 text-sm text-gray-600 mt-1'> <MdPhone /><span>{data?.user?.mobile}</span></p>
      </div>

      <div className='flex flex-col items-start gap-2 text-gray-600 text-sm'>
        <p>{data?.deliveryAddress?.text}</p>
        <p className='text-xs text-gray-500'>Lat: {data?.deliveryAddress?.latitude}, Lon: {data?.deliveryAddress?.longitude}</p>

      </div>

      <div className='flex space-x-4 overflow-x-auto pb-2'>
        {/* we don't need to map shopOrders here as owner orders are specific to his shop only one shopOrder will be there */}
        {/* map and display each ordered item inside  shop order */}
        {data?.shopOrders[0]?.shopOrderItems.map((shopItem, idx) => (
          <div key={idx} className='shrink-0 w-40 border rounded-lg p-2 bg-white'>
            <img src={shopItem?.item?.image} alt={shopItem?.item?.name} className='w-full h-24 object-cover rounded' />
            <p className='text-sm font-semibold mt-1'>{shopItem?.item?.name}</p>
            <p>₹{shopItem?.item?.price} X {shopItem?.quantity}  </p>
          </div>


        ))}


      </div>

      <div className='flex justify-between items-center mt-auto pt-3 border-t border-gray-400'>
        <span className='text-sm'>Status: <span className='font-semibold capitalize text-[#ff4d2d]'>{data?.shopOrders[0]?.status}</span></span>

        <select onChange={(e) => handleStatusChange(e.target.value)} className='rounded-md border px-3 py-1 text-sm focus:outline-none focus:ring-2 border-[rgb(255,77,45)] text-[#ff4d2d]'>
          <option >Change Status</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="out-for-delivery">Out for delivery</option>
        </select>
      </div>

      {
        data?.shopOrders[0]?.status == "out-for-delivery" &&
        <div className='mt-2 p-2 border rounded-lg text-sm bg-orange-50'>

          {data?.shopOrders[0]?.assignedDeliveryBoy ? <p  className='text-lg text-[#ff4d2d] font-semibold'>Assigned Delivery Boy : </p> : <p className='text-lg font-semibold'>Availabe Delivery Boys : </p>}


          {availableDeliveryBoys.length > 0 ?
            <div>
              {availableDeliveryBoys.map((b, index) => (
                <div key={index} className='text-gray-800 font-bold'>Name: {b.fullName} - Phone No: {b.mobile}</div>
              ))}
            </div>

            //if any delivery boy except this order then show his details here 
            : data?.shopOrders[0]?.assignedDeliveryBoy ?
              (<div className=' flex flex-col justify-center text-left gap-1'>
                <p className='font-semibold text-gray-800'>Name: {data?.shopOrders[0]?.assignedDeliveryBoy?.fullName}</p>
                <p className='font-semibold text-gray-800'>Phone no: {data?.shopOrders[0]?.assignedDeliveryBoy?.mobile}</p>
                <p className='font-semibold text-gray-800'>Email: {data?.shopOrders[0]?.assignedDeliveryBoy?.email}</p>
              </div>)
              :
              // show this till no delivery boy except the order 
              (<div className='text-gray-800'>
                Waiting for delivery boy to accept
              </div>)}
        </div>
      }

      {/* display subtotal for particular shop order */}
      <div className='border-t pt-2 text-right font-semibold '>
        Total: ₹{data?.shopOrders[0]?.subTotal}
      </div>


    </div>
  )
}

export default OwnerOrderCard
