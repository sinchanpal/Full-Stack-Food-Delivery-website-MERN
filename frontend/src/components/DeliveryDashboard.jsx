import React, { useEffect, useState } from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import axios from 'axios';
import { serverUrl } from '../App';

const DeliveryDashboard = () => {

  const { userData, userAddress } = useSelector(state => state.user);
  const [availableAssignments, setAvailableAssignments] = useState([]);

  const getDeliveryBoyAssignments = async (req, res) => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-deliveryboy-assignments`, { withCredentials: true })
      setAvailableAssignments(result?.data || []);
      console.log(result.data);
    } catch (error) {
      console.log("Error in getDeliveryBoyAssignments in DeliveryDashboard.jsx ", error);
    }
  }

  useEffect(() => {
    getDeliveryBoyAssignments();
  }, [userData, userAddress]);

  //This function works when delivery boy excepts the order
  const acceptOrder = async (assignmentId) => {
    try {
      const result = await axios.post(`${serverUrl}/api/order/accept-delivery-assignment`, { assignmentId }, { withCredentials: true })
      console.log(result.data);
    } catch (error) {
      console.log("Error in acceptOrder in DeliveryDashboard.jsx ", error);
    }
  }

  return (
    <div className='w-screen min-h-screen bg-[#fff9f6] flex flex-col items-center gap-5 pt-24 overflow-y-auto'>
      <Nav />

      <div className='w-full max-w-[800px] flex flex-col gap-5 items-center'>

        <div className='bg-white rounded-2xl shadow-md p-5 flex flex-col justify-between items-center w-[90%] border border-orange-100 gap-y-1'>
          <h1 className='text-xl font-bold text-[#ff4d2d]'>Welcome, {userData.fullName}</h1>
          <p className='text-gray-700 text-sm'>
            <span className='font-semibold text-[#ff4d2d] text-lg'>Current Address :</span> {userAddress}
          </p>
          <p className='text-gray-700 text-sm'>
            <span className='font-semibold text-[#ff4d2d] text-lg'>latitude :</span> {userData?.location?.coordinates?.[1]} ,<span className='font-semibold text-[#ff4d2d] text-lg'>longitude :</span> {userData?.location?.coordinates?.[0]}
          </p>
        </div>

        <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
          <h1 className='text-lg font-bold mb-4 flex items-center gap-2'>Available Orders</h1>

          <div className='space-y-4'>

            {availableAssignments.length > 0 ? (
              availableAssignments.map((a, index) => (
                <div className='border rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4' key={index}>
                  <div>
                    <p className='text-xs text-gray-500'>Order id : {a?.orderId?.slice(-6,)}</p>
                    <p className='text-sm font-semibold'>Shop Name : {a?.shopName}</p>
                    <p className='text-xs font-semibold'>Shop Address: {a?.shopAddress}</p>
                    <p className='text-xs font-semibold text-gray-700'>Delivery Address: {a?.deliveryAddress?.text}</p>
                    <p className='text-xs text-gray-500'>Total Items: {a?.shopOrderItems?.length} | Amount: {a?.subTotal}</p>
                  </div>

                  <button className='bg-orange-500 text-white px-4 py-1 rounded-lg text-sm font-semibold cursor-pointer hover:bg-orange-600' onClick={() => acceptOrder(a.assignmentId)}>Accept</button>
                </div>
              ))
            ) : <p className='text-gray-400 text-sm'>No Available Orders to Pick</p>}
          </div>


        </div>
      </div>
    </div>
  )
}

export default DeliveryDashboard
