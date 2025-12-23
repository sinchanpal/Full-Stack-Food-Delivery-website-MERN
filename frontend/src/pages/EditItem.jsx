import React, { use, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoFastFoodSharp } from "react-icons/io5";
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setMyShopData } from '../redux/ownerSlice';
import { ClipLoader } from 'react-spinners';




const EditItem = () => {


    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { itemId } = useParams();


    //This are the predefined categories for items
    const categories = [
        "Snacks",
        "Main Course",
        "Biryani",
        "Pizza",
        "Burger",
        "Rolls",
        "Chinese",
        "South Indian",
        "North Indian",
        "Momos",
        "Dessert",
        "Drinks"
    ];

    //all input state
    const [currItemData, setCurrItemData] = useState(null);
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState("");
    const [foodType, setFoodType] = useState("Veg");


    const [frontendImage, setFrontendImage] = useState(null); //this state is use for showing image in front of the form
    const [backendImage, setBackendimage] = useState(null); //this state is used for send the image to the backend and store in DB

    const [loading, setLoading] = useState(false);



    //fetch the item data on component mount
    useEffect(() => {
        //fetch the item data from backend using itemId from params and set the states
        const fetchItemData = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/item/get-particular-item/${itemId}`, { withCredentials: true });

                if (!result) {
                    console.log("Can't find the item with this id ! ");
                }

                console.log(result.data);

                //set the current item data with fetched data
                setCurrItemData(result.data);




            } catch (error) {
                console.log("Error in fetchItemData in EditItem.jsx ! ", error);
            }
        }
        fetchItemData();
    }, [itemId]);


    //set the form fields when currItemData changes
    useEffect(() => {
        if (currItemData) {
            setName(currItemData?.name || "");
            setPrice(currItemData?.price || 0);
            setCategory(currItemData?.category || "");
            setFoodType(currItemData?.foodType || "veg");
            setFrontendImage(currItemData?.image || null);
        }
    }, [currItemData]);



    //this function is used for handle input image
    const handleImage = (e) => {
        const file = e.target.files[0];
        setBackendimage(file); //we store the complete file in setBackendimage
        setFrontendImage(URL.createObjectURL(file)); //we create a URL of our image file then store it to setFrontendImage
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        //add your form submit logic here
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("price", price);
            formData.append("category", category);
            formData.append("foodType", foodType);

            if (backendImage) {
                formData.append("image", backendImage);
            }
            //send formData to backend using axios 

            const result = await axios.post(`${serverUrl}/api/item/edit-item/${itemId}`, formData, { withCredentials: true });

            dispatch(setMyShopData(result.data)); //update the shop data in redux store after adding new item
            console.log("Item Added", result.data);
            setLoading(false);
            navigate('/');  //after item added navigate to home page    


        } catch (error) {
            console.log("Error in handleSubmit in AddItem.jsx !", error);
        }
    }







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

                        <IoFastFoodSharp className='text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20' />

                    </div>

                    {/* Create or Edit text based on if we have shop data or not */}
                    <div className='text-3xl font-extrabold text-gray-800'>
                        Edit Item
                    </div>

                </div>

                <form className='space-y-5' onSubmit={handleSubmit}>

                    {/* Name field */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'> Item Name</label>
                        <input type="text" placeholder='Enter Item Name' className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500' value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    {/* Item Image field */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'> Item Image</label>
                        <input type="file" accept='image/*' className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500' onChange={handleImage} />


                        {frontendImage &&
                            <div className='mt-4'>
                                <img src={frontendImage} alt="" className='w-full h-48 object-cover rounded-lg border' />
                            </div>}

                    </div>


                    {/* Price field */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'> Item Price</label>
                        <input type="number" placeholder='Enter Item Price' className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500' value={price} onChange={(e) => setPrice(e.target.value)} />
                    </div>

                    {/* Category field */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'> Category</label>
                        <select className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500' value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="">Select Category</option>
                            {categories.map((category, index) => {
                                return <option key={index} value={category}>{category}</option>
                            })}
                        </select>
                    </div>

                    {/* Food Type field */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'> Food Type</label>
                        <select className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500' value={foodType} onChange={(e) => setFoodType(e.target.value)}>
                            <option value="">Select Food Type</option>
                            <option value="veg">Veg</option>
                            <option value="non veg">Non Veg</option>
                        </select>
                    </div>





                    <button type='submit' className='w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 cursor-pointer' disabled={loading}>

                        {loading ? <ClipLoader color='white' size={20} /> : "Save"}

                    </button>
                </form>

            </div>
        </div>
    )
}

export default EditItem
