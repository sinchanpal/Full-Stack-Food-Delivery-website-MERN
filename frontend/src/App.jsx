import { useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import UseGetCurrUser from './hooks/UseGetCurrUser'
import { useSelector } from 'react-redux'
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
        <Route path='/track-customer-order/:orderId' element={userData ? <TrackCustomerOrder/> : <Navigate to={"/signin"} />} />
      </Routes>
    </>
  )
}

export default App
