import React, { useState } from 'react'
import { FaPenAlt } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { useDispatch } from 'react-redux';
import { setMyShopData } from '../redux/ownerSlice';

const OwnerItemCard = ({ data }) => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);



    const handleDeleteItem = async () => {

        setLoading(true);
        const itemId = data._id;

        try {

            const deleteRes = await axios.delete(`${serverUrl}/api/item/delete-item/${itemId}`, { withCredentials: true });

            if (!deleteRes) {
                console.log("Error in Delete Item logic !");
            }
            console.log("Item deleted successfully ! ", deleteRes.data);
            dispatch(setMyShopData(deleteRes.data)); //set the updated shop data after deleting the item
            setLoading(false);
            navigate('/') //after deleting the item navigate to home page to see the updated shop items

        } catch (error) {
            console.log("Error in handleDeleteItem function!", error);
        }
    }


    return (
        <div className='flex bg-white rounded-lg shadow-md overflow-hidden border border-[#ff4d2d] w-full max-w-2xl'>
            <div className='w-36 h-32 shrink-0 bg-gray-50 flex'>
                <img src={data.image} alt={data.name} className='w-full h-full object-cover' />
            </div>

            <div className='flex flex-col justify-between p-3 flex-1'>
                <div>
                    <h2 className='text-base font-semibold text-[#ff4d2d]'>{data.name}</h2>
                    <p className='text-gray-600 text-sm mt-1'>Category: {data.category}</p>
                    <p className='text-gray-600 text-sm mt-1'>Food Type: {data.foodType}</p>
                </div>

                <div className='flex items-center justify-between'>
                    <div className='text-[#ff4d2d] font-bold'>Price: {data.price}₹</div>

                    <div className='flex items-center gap-2'>

                        <div title="Edit Item" className='p-1 rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d] cursor-pointer'>
                            <FaPenAlt size={20} onClick={() => navigate(`/edit-item/${data._id}`)} />
                        </div>

                        <div title='Delete Item' className='p-1 rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d] cursor-pointer'>

                            {loading ? <ClipLoader color='orange' size={20} /> : <FaTrash size={20} onClick={handleDeleteItem} />}

                        </div>

                    </div>

                </div>
            </div>
        </div>
    )
}

export default OwnerItemCard
