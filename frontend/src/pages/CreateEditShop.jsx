import React, { useState } from 'react'
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaUtensils } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { serverUrl } from '../App';
import axios from 'axios';
import { setMyShopData } from '../redux/ownerSlice';
import { ClipLoader } from 'react-spinners';

const CreateEditShop = () => {


    const { myShopData } = useSelector(state => state.owner);
    const { userCity, userState, userAddress } = useSelector(state => state.user);
    const dispatch = useDispatch();


    //all input state
    const [name, setName] = useState(myShopData?.name || ""); //if myShopData exist means we have shop data then set that value else store empty string
    const [city, setCity] = useState(myShopData?.city || userCity); //if myShopData exist means we have shop data then set that city value else store current user city which we store in our redux store 
    const [state, setState] = useState(myShopData?.state || userState); //if myShopData exist means we have shop data then set that state value else store current user state which we store in our redux store 
    const [address, setAddress] = useState(myShopData?.address || userAddress); //if myShopData exist means we have shop data then set that address value else store current user address which we store in our redux store 

    const [frontendImage, setFrontendImage] = useState(myShopData?.image || null); //this state is use for showing image in front of the form
    const [backendImage, setBackendimage] = useState(null); //this state is used for send the image to the backend and store in DB

    const [loading, setLoading] = useState(false);

    //this function is used for handle input image
    const handleImage = (e) => {
        const file = e.target.files[0];
        setBackendimage(file); //we store the complete file in setBackendimage
        setFrontendImage(URL.createObjectURL(file)); //we create a URL of our image file then store it to setFrontendImage
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();     // JSON ({ name: "Shop" }) is like a standard Letter Envelope. It is perfect for sending text, words, and numbers. It is light and fast.You are trying to send an Image. An image is a heavy, complex file (binary data).If you try to stuff an Image into a JSON "Envelope", it will rip (or you have to do complex math to convert it to text first).FormData allows you to pack Text (Shop Name) and Files (Image) into one single package and ship it to the backend.


            formData.append("name", name); //adding key value pair to formData
            formData.append("city", city);
            formData.append("state", state);
            formData.append("address", address);

            if (backendImage) {
                formData.append("image", backendImage);
            }


            const result = await axios.post(`${serverUrl}/api/shop/create-edit-shop`, formData, { withCredentials: true });

            dispatch(setMyShopData(result.data));
            console.log("Shop Created ", result.data);
            setLoading(false);
            navigate('/');  //after shop created send user to home page


        } catch (error) {
            console.log("Error in handleSubmit in CreateEditShop.jsx ! ", error);
        }
    }




    const navigate = useNavigate();
    return (
        <div className='flex justify-center items-center flex-col p-6 bg-linear-to-br from-orange-100 relative to-white min-h-screen'>
            <div className='absolute top-5 left-5 z-10 mb-2'>

                {/* Back Button on click we navigate to home page */}
                <IoMdArrowRoundBack size={45} className='text-[#ff4d2d] cursor-pointer' onClick={() => navigate('/')} />
            </div>

            <div className='max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-200' >
                <div className='flex flex-col items-center mb-6'>

                    {/* spoon Icon */}
                    <div className='bg-orange-100 p-4 rounded-full mb-4'>
                        <FaUtensils className='text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20' />
                    </div>

                    {/* Create or Edit text based on if we have shop data or not */}
                    <div className='text-3xl font-extrabold text-gray-800'>
                        {myShopData ? "Edit Shop" : "Create Shop"}
                    </div>

                </div>

                <form className='space-y-5' onSubmit={handleSubmit}>

                    {/* Name field */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'> Shop Name</label>
                        <input type="text" placeholder='Enter Shop Name' className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500' value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    {/* Shop Image field */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'> Shop Image</label>
                        <input type="file" accept='image/*' className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500' onChange={handleImage} />


                        {frontendImage &&
                            <div className='mt-4'>
                                <img src={frontendImage} alt="" className='w-full h-48 object-cover rounded-lg border' />
                            </div>}

                    </div>


                    {/* Shop City and State */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

                        {/* City input */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'> City</label>
                            <input type="text" placeholder='Enter City' className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500' value={city} onChange={(e) => setCity(e.target.value)} />
                        </div>

                        {/* State input */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'> State</label>
                            <input type="text" placeholder='Enter State' className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500' value={state} onChange={(e) => setState(e.target.value)} />
                        </div>
                    </div>


                    {/* Shop Address field */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'> Shop Address</label>
                        <input type="text" placeholder='Enter Shop Address' className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500' value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>

                    <button type='submit' className='w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 cursor-pointer' disabled={loading}>
                        {loading ? <ClipLoader color='white' size={20} /> : "Save"}
                    </button>
                </form>

            </div>
        </div>
    )
}

export default CreateEditShop
