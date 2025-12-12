import { useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import UseGetCurrUser from './hooks/UseGetCurrUser'
import { useSelector } from 'react-redux'
import Home from './pages/Home'
import UseGetCity from './hooks/UseGetCity'

export const serverUrl = "http://localhost:8000"


function App() {


  //afetr initializing our app first we call this function to get some information
  UseGetCurrUser();
  UseGetCity();

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
      </Routes>
    </>
  )
}

export default App
