import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import { setMyOrders, updateMyOrderStatus } from '../redux/userSlice';
import { useSocketContext } from '../context/SocketContext';

const MyOrders = () => {

    const { userData, myOrders } = useSelector(state => state.user);
    const { socket } = useSocketContext();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {

        if (!socket) return; //if socket is not connected yet then we return from here because we can't listen any socket event without socket connection

        // Create a named function 
        const handleNewOrder = (newOrder) => {
            if (newOrder && newOrder?.shopOrders[0]?.owner?._id == userData?._id) {
                dispatch(setMyOrders([newOrder, ...myOrders])); //here we add new order at the beginning of myOrders array because we want to show latest order first in the list of orders
            }
        }

        const handleUpdateOrderStatus = ({ orderId, shopOrderId, status, userId }) => {

            if (userId && userId == userData?._id) {
                dispatch(updateMyOrderStatus({ orderId, shopOrderId, status }));  //here we send this 3 details to our reducer to update the particular shop order status in myOrders array in redux store so now we can see the updated status of that shop order instantly in our orders section without refresh
            }

        }

        //  Turn ON the listener using the named function
        socket?.on("new-order", handleNewOrder); //here we listen new-order event which is emitted from backend when new order is placed and we update our myOrders array in redux store by adding the new order at the beginning of myOrders array so now we can see the new order instantly in our orders section without refresh

        socket?.on("order-status-updated", handleUpdateOrderStatus);  //here we listen order-status-updated event which is emitted from backend when order status is changed  and we update the particular shop order in myOrders array in redux store  so now we can see the updated status of that shop order instantly in our orders section without refresh


        return () => {
            //  Turn OFF ONLY this specific listener when cleaning up
            socket?.off("new-order", handleNewOrder); //when component unmounts we turn off the socket event listener to prevent memory leaks and unwanted behavior
            socket?.off("order-status-updated", handleUpdateOrderStatus)
        }
    }, [socket, myOrders, userData, dispatch]);



    return (
        <div className='w-full min-h-screen bg-[#fff9f6] flex justify-center px-4'>
            <div className='w-full max-w-[800px] p-4'>

                <div className='flex items-center gap-5 mb-6'>

                    <IoMdArrowRoundBack size={45} className='text-[#ff4d2d] cursor-pointer' onClick={() => navigate('/')} />
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
