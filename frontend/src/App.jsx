import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import UseGetCurrUser from './hooks/UseGetCurrUser'
import { useDispatch, useSelector } from 'react-redux'
import Home from './pages/Home'
import UseGetCity from './hooks/UseGetCity'
import UseGetUserShop from './hooks/UseGetUserShop'
import CreateEditShop from './pages/CreateEditShop'
import AddItem from './pages/AddItem'
import EditItem from './pages/EditItem'
import UseGetAllShopsInCurrCity from './hooks/UseGetAllShopsInCurrCity'
import UseGetAllitemsInCity from './hooks/UseGetAllitemsInCity'
import CartPage from './pages/CartPage'
import CheckOut from './pages/CheckOut'
import OrderPlaced from './pages/OrderPlaced'
import MyOrders from './pages/MyOrders'
import UseGetMyOrders from './hooks/UseGetMyOrders'
import UseUpdateLocation from './hooks/UseUpdateLocation'
import TrackCustomerOrder from './pages/TrackCustomerOrder'
import ShopDetails from './pages/ShopDetails'
import { io } from 'socket.io-client'
import { setSocket } from './redux/userSlice'

export const serverUrl = "http://localhost:8000"


function App() {


  //?afetr initializing our app first we call this function to get some information
  UseGetCurrUser();
  UseGetCity();
  UseGetUserShop();
  UseGetAllShopsInCurrCity();
  UseGetAllitemsInCity();
  UseGetMyOrders();
  UseUpdateLocation();

  const { userData } = useSelector(state => state.user)

  const dispatch = useDispatch();



  //TODO: currently I store socketInstance in redux store using  dispatch(setSocket(socketInstance)) for use it on any other components.Redux has a strict rule: You should only store plain, serializable data in Redux (like strings, numbers, arrays, and basic objects). A socketInstance is a massive, complex object with circular references and hidden functions. Storing it in Redux will trigger a huge A non-serializable value was detected in the state error in your console, and it can severely slow down or break your app. (This is why I highly recommended the React Context approach in my previous message—it avoids Redux completely for sockets!)

  useEffect(() => {
    const socketInstance = io(serverUrl, { withCredentials: true }); //now we connect our frontend with backend by using socket.io-client and we create a socket connection instance here in App.jsx file because we want to maintain only one socket connection instance for whole app and we can use this socket connection instance in any component by using useSelector hook and get the real time updates of order status when owner change the status of shopOrder in his orders section
    dispatch(setSocket(socketInstance));

    socketInstance.on("connect", () => { //connect is a built in event of socket.io which is triggered when we successfully connect with backend and create a socket connection instance
      if(userData){
        socketInstance.emit("identity",{userId: userData._id}); 
      }
    })

    return ()=>{
      socketInstance.disconnect(); //when our component unmounts then we disconnect our socket connection to avoid memory leaks
    }

  }, [userData?._id]);





  return (
    <>


      <Routes>
        {/* //! Note If you want to check Signup or SignIn page 1st change the navigate setting here or you directly move to home page if got userData */}
        <Route path='/' element={userData ? <Home /> : <Navigate to={"/signup"} />} />
        {/* //? if we dont have user Data then show Signup Page directly */}
        <Route path='/signup' element={!userData ? <SignUp /> : <Navigate to={"/"} />} />
        {/* //? if we have userData then why show SignUp Or SignIn page navigate to Home page directly */}
        <Route path='/signin' element={!userData ? <SignIn /> : <Navigate to={"/"} />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/create-edit-shop' element={userData ? <CreateEditShop /> : <Navigate to={"/signin"} />} />
        <Route path='/add-item' element={userData ? <AddItem /> : <Navigate to={"/signin"} />} />
        <Route path='/edit-item/:itemId' element={userData ? <EditItem /> : <Navigate to={"/signin"} />} />
        <Route path='/cart' element={userData ? <CartPage /> : <Navigate to={"/signin"} />} />
        <Route path='/checkout' element={userData ? <CheckOut /> : <Navigate to={"/signin"} />} />
        <Route path='/order-placed' element={userData ? <OrderPlaced /> : <Navigate to={"/signin"} />} />
        <Route path='/my-orders' element={userData ? <MyOrders /> : <Navigate to={"/signin"} />} />
        <Route path='/track-customer-order/:orderId' element={userData ? <TrackCustomerOrder /> : <Navigate to={"/signin"} />} />
        <Route path='/get-shop-details-by-id/:shopId' element={userData ? <ShopDetails /> : <Navigate to={"/signin"} />} />
      </Routes>
    </>
  )
}

export default App
