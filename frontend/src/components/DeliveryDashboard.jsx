import React, { useEffect, useState } from 'react'
import Nav from './Nav'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios';
import { serverUrl } from '../App';
import DeliveryBoyTracking from './DeliveryBoyTracking';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useSocketContext } from '../context/SocketContext';
import toast from 'react-hot-toast';

const DeliveryDashboard = () => {

  const { userData, userAddress } = useSelector(state => state.user);
  const { socket } = useSocketContext();
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [currentAcceptedOrder, setCurrentAcceptedOrder] = useState(null);

  const [otpSection, setOtpSection] = useState(false);
  const [otp, setOpt] = useState("");

  const [dailyStats, setDailyStats] = useState({ totalEarnings: 0, chartData: [] })


  //? Fetch today's delivery stats
  const fetchDailyStats = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/delivery-stats`, { withCredentials: true });
      setDailyStats(result.data);
    } catch (error) {
      console.log("Error fetching daily stats:", error);
    }
  }


  //for send a otp to customer
  const handelSendOTP = async (orderId, shopOrderId) => {

    try {
      setOtpSection(true);
      const result = await axios.post(`${serverUrl}/api/order/send-delivery-otp`, { orderId, shopOrderId }, { withCredentials: true })

      console.log(result.data);

      // Extract the OTP from the backend response
      const getOtp = result.data.otp;

      // Show a highly visible, custom toast notification that stays open longer (10 seconds)
      toast.success(
        <div>
          <b>Delivery Confirmation OTP</b><br />
          Hi👋  Your OTP for delivery Confirmation is<br />
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d2d' }}>{getOtp}</span>
        </div>,
        { duration: 10000 } // Stays on screen for 10 seconds
      );

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

      // Clear the current order so the dashboard goes back to the "Available Orders" view
      setCurrentAcceptedOrder(null);

      // Optional: Give the delivery boy a nice success message!
      toast.success("Order Delivered Successfully! Great job.", { duration: 4000 }); // Stays on screen for 4 seconds

      //Re-fetch available orders just in case new ones popped up while they were driving
      getDeliveryBoyAssignments();

      //Re-fetch the stats so the chart and earnings update instantly!
      fetchDailyStats();

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
    fetchDailyStats();
  }, [userData, userAddress]);



  useEffect(() => {

    if (!socket) return; //if socket is not connected yet then we return from here because we can't listen any socket event without socket connection


    const handelNewDeliveryAssignment = (newAssignment) => {

      if (newAssignment && newAssignment?.deliveryBoyId == userData?._id) {
        setAvailableAssignments(prevAssignments => [newAssignment, ...prevAssignments]);  //here if we get new delivery assignment from backend and if this new delivery assignment is for this delivery boy then we add this new assignment at the beginning of availableAssignments array because we want to show latest assignment first in the list of available assignments
      }

    }
    socket?.on("new-delivery-assignment", handelNewDeliveryAssignment);  //here we listen new-delivery-assignment event which is emitted from backend. when order status is changed and the status is "out-for-delivery" then we take the send value and set the value to the useState  setAvailableAssignments so now this delivery assignment appears instantly in our delivery boy dashboard section without refresh


    return () => {  //when component unmounts we turn off the socket event listener to prevent memory leaks and unwanted behavior
      socket?.off("new-delivery-assignment", handelNewDeliveryAssignment);
    }

  }, [socket]);



  //? This useEffect is for tracking delivery boy GPS location and send the updated location to backend via socket so that we can show the real time location of delivery boy in customer order tracking page (TrackCustomerOrder.jsx)
  useEffect(() => {

    if (!socket || !currentAcceptedOrder) return; //if socket is not connected yet then we return from here because we can't listen any socket event without socket connection

    // navigator.geolocation.watchPosition runs every time the device's GPS location changes
    const watchId = navigator.geolocation.watchPosition(

      (position) => {
        const { latitude, longitude } = position.coords;

        // 1. Emit the location to the backend in socket.js(for the customer)
        socket.emit("update-deliveryBoy-location", {
          customerId: currentAcceptedOrder.user._id,
          lat: latitude,
          lon: longitude
        });

        // 2. Update the Delivery Boy's OWN local state with the new location so their map moves!
        setCurrentAcceptedOrder((prevOrder) => {
          if (!prevOrder) return prevOrder;

          return {
            ...prevOrder,
            deliveryBoyLocation: {
              lat: latitude,
              lon: longitude
            }
          };

        });


      },

      (error) => {
        console.log("Error watching GPS location:", error);
      },

      {
        enableHighAccuracy: true, // Use GPS for more accurate location
        maximumAge: 0, // Don't use cached location
        timeout: 5000 // Timeout after 5 seconds.If you can't find the GPS signal in 5 seconds (5000 milliseconds), stop trying and give me an error.
      }
    );

    // CLEANUP: Stop tracking their GPS when they deliver the order or leave the page. 
    // This saves their phone battery!
    return () => {
      navigator.geolocation.clearWatch(watchId);
    }

  }, [socket, currentAcceptedOrder]);




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
            <span className='font-semibold text-[#ff4d2d] text-lg'>latitude :</span> {currentAcceptedOrder?.deliveryBoyLocation?.lat || userData?.location?.coordinates?.[1]} ,<span className='font-semibold text-[#ff4d2d] text-lg'>longitude :</span> {currentAcceptedOrder?.deliveryBoyLocation?.lon || userData?.location?.coordinates?.[0]}
          </p>
        </div>


        {/* Daily Delivery Stats Visualization Section */}
        <div className='bg-white rounded-2xl shadow-md p-6 w-[90%] border border-orange-100'>
          <h2 className='text-lg font-bold text-[#ff4d2d] mb-6'>Today Deliveries</h2>

          {/* The Chart */}
          <div className='w-full h-[200px] mb-4'>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats.chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#fef2f2' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="deliveries" fill="#ff4d2d" radius={[4, 4, 0, 0]} barSize={40} />

              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Earnings Display */}
          <div className='mt-6 bg-white border shadow-sm rounded-2xl py-4 flex flex-col items-center justify-center max-w-[300px] mx-auto'>
            <p className='font-bold text-gray-700 text-lg'>Today's Earning</p>
            <p className='text-3xl font-bold text-green-600 mt-1'>₹{dailyStats.totalEarnings}</p>
          </div>
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

            {currentAcceptedOrder?.deliveryBoyLocation?.lat && currentAcceptedOrder?.deliveryBoyLocation?.lon ? (<DeliveryBoyTracking data={currentAcceptedOrder} />) :
              (
                <div className='w-full h-[400px] mt-3 rounded-xl bg-gray-200 flex items-center justify-center text-gray-500 font-semibold'>
                  Locating GPS... 📍
                </div>
              )}


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
