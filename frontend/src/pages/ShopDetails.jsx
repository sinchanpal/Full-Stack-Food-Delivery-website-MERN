import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { serverUrl } from '../App';
import { useNavigate, useParams } from 'react-router-dom';
import { FcShop } from "react-icons/fc";
import { MdLocationOn } from "react-icons/md";
import { MdOutlineMenuBook } from "react-icons/md";
import { PiSmileySadThin } from "react-icons/pi";
import ItemCard from '../components/ItemCard';
import { IoMdArrowRoundBack } from "react-icons/io";

const ShopDetails = () => {
    const navigate = useNavigate();
    const { shopId } = useParams();
    const [shopDetails, setShopDetails] = useState([]);
    const [shopItems, setShopItems] = useState([]);

    const handleShopDetailsById = async () => {
        try {


            const result = await axios.get(`${serverUrl}/api/shop/get-shop-by-id/${shopId}`, { withCredentials: true });

            setShopDetails(result?.data?.shop);
            setShopItems(result?.data?.items);
            console.log(result.data);
        } catch (error) {
            console.log("Error in handleShopDetailsById", error);
        }
    }


    useEffect(() => {
        handleShopDetailsById();
    }, [shopId])

    return (
        <div className='min-h-screen bg-amber-50'>

            <div className='absolute top-5 left-5 z-10 mb-2'>

                {/* Back Button on click we navigate to home page */}
                <IoMdArrowRoundBack size={45} className='text-[#ff4d2d] cursor-pointer' onClick={() => navigate('/')} />
            </div>

            {/* show shop name and address and bg image */}
            {shopDetails &&
                <div className='relative w-full h-64 md:h-80 lg:h-96'>
                    <img src={shopDetails.image} alt={shopDetails.name} className='w-full h-full object-cover' />
                    <div className='absolute inset-0 bg-linear-to-b from-black/60 to-black/30 flex flex-col justify-center items-center text-center px-4'>
                        <FcShop className='text-7xl mb-3 drop-shadow-md' />
                        <h1 className='text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg'>{shopDetails?.name}</h1>

                        <div className='flex items-center gap-1'>
                            <MdLocationOn className='text-2xl text-red-400' />
                            <p className='text-lg font-medium text-amber-100'>{shopDetails?.address}</p>
                        </div>

                    </div>
                </div>}

            {/* show all items of this shop  */}
            {shopDetails &&
                <div className='max-w-7xl mx-auto px-6 py-10'>
                    <h2 className='flex justify-center items-center gap-3 text-3xl font-bold mb-10 text-gray-800'><MdOutlineMenuBook className='text-orange-500' />Our Menu<MdOutlineMenuBook className='text-orange-500' /></h2>

                    {shopItems.length > 0 ?
                        (<div className='flex flex-wrap justify-center gap-8'>
                            {shopItems.map((item, index) => (
                                <ItemCard item={item} key={index} />
                            ))}
                        </div>) :
                        <p className='flex justify-center items-center gap-3 text-center text-gray-700 text-3xl font-semibold'>No Items Available.<PiSmileySadThin /></p>}
                </div>}
        </div>
    )
}

export default ShopDetails
