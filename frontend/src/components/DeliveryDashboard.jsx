import React, { useEffect, useState } from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import axios from 'axios';
import { serverUrl } from '../App';
import DeliveryBoyTracking from './DeliveryBoyTracking';

const DeliveryDashboard = () => {

  const { userData, userAddress } = useSelector(state => state.user);
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [currentAcceptedOrder, setCurrentAcceptedOrder] = useState(null);

  const [otpSection, setOtpSection] = useState(false);
  const [otp, setOpt] = useState("");


  //for send a otp to customer
  const handelSendOTP = async (orderId, shopOrderId) => {

    try {
      setOtpSection(true);
      const result = await axios.post(`${serverUrl}/api/order/send-delivery-otp`, { orderId, shopOrderId }, { withCredentials: true })
      console.log(result.data);
    } catch (error) {
      console.log("Error in handelSendOTP in DeliveryDashboard.jsx ", error);
    }

  }

  //verify customer otp with delivery boy input otp
  const handelVerifyOTP = async (orderId, shopOrderId) => {

    try {

      const result = await axios.post(`${serverUrl}/api/order/verify-delivery-otp`, { otp, orderId, shopOrderId, }, { withCredentials: true })
      console.log(result.data);
      setOtpSection(false);
    } catch (error) {
      console.log("Error in handelVerifyOTP in DeliveryDashboard.jsx ", error);
    }

  }

  const getDeliveryBoyAssignments = async () => {
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
    getCurrentAcceptOrder();
  }, [userData, userAddress]);

  //This function works when delivery boy excepts the order
  const getCurrentAcceptOrder = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-current-accepted-order`, { withCredentials: true })
      console.log(result.data);
      setCurrentAcceptedOrder(result?.data);
    } catch (error) {
      console.log("Error in getCurrentAcceptOrder in DeliveryDashboard.jsx ", error);
    }
  }

  //This function works when delivery boy excepts the order
  const acceptOrder = async (assignmentId) => {
    try {
      const result = await axios.post(`${serverUrl}/api/order/accept-delivery-assignment`, { assignmentId }, { withCredentials: true })
      console.log(result.data);
      await getCurrentAcceptOrder(); //when deliery boy accept the order fetch the accepted current order
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


        {!currentAcceptedOrder && (  //if there is no accept order then show this div

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
        )}


        {currentAcceptedOrder && (  //if there is a accept order then show this div
          <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
            <h2 className='text-lg font-bold mb-3 text-[#ff4d2d]'>📦 Current Order</h2>

            <div className='border rounded-lg p-4 mb-3 border-orange-300'>
              <p className='font-semibold text-sm'>🏪 Shop Name : {currentAcceptedOrder?.shop?.name}</p>
              <p className='text-sm text-gray-600'>📍 Delivery Address : {currentAcceptedOrder?.deliveryAddress?.text}</p>
              <p className='text-sm text-gray-500'>🛵 Total items to Pick : {currentAcceptedOrder?.shopOrder?.shopOrderItems.length} | ₹{currentAcceptedOrder?.shopOrder?.subTotal}</p>
            </div>

            {/* This is a map for showing deliveryBoy and customer home */}
            <DeliveryBoyTracking data={currentAcceptedOrder} />

            {/* when a deliveryBoy click on mark as delivered button then a otp is send to the particular customer then the deliveryBoy verify the otp  */}
            {!otpSection &&
              <button className='mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200' onClick={() => handelSendOTP(currentAcceptedOrder._id, currentAcceptedOrder.shopOrder._id)}>Mark As Delivered</button>}

            {otpSection &&
              <div className='my-4 p-4 border rounded-xl bg-gray-50'>
                <p className='text-sm font-semibold mb-2'>A OTP send to customer : <span className='text-[#ff4d2d]'>{currentAcceptedOrder.user.fullName}</span></p>
                <input type="text" placeholder='Verify the otp' className='w-full mb-2 border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 font-semibold' onChange={(e) => setOpt(e.target.value)} value={otp} />
                <button className='w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all' onClick={() => handelVerifyOTP(currentAcceptedOrder._id, currentAcceptedOrder.shopOrder._id)}>Submit OTP</button>
              </div>}

          </div>
        )}

      </div>
    </div>
  )
}

export default DeliveryDashboard
