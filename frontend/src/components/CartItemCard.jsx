
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { useDispatch } from 'react-redux';
import { removeCartItem, updateQuantity } from '../redux/userSlice';


//TODO check this file
const CartItemCard = ({ data }) => {


    const dispatch = useDispatch();

    const increaseQuantity = (id, currentQty) => {
        dispatch(updateQuantity({ itemId: id, quantity: currentQty + 1 }));

    }

    const decreaseQuantity = (id, currentQty) => {

        if (currentQty > 1) {
            dispatch(updateQuantity({ itemId: id, quantity: currentQty - 1 }));
        }



    }
    return (
        <div className='flex items-center justify-between bg-white p-4 rounded-xl shadow border'>
            <div className='flex items-center gap-4'>
                <img src={data.image} alt={data.name} className='w-20 h-20 object-cover rounded-lg border' />
                <div>
                    <h1 className='font-medium text-gray-800'>{data.name}</h1>
                    <p className='text-sm text-gray-500'>₹{data.price}X{data.quantity}</p>
                    <p className='font-bold text-gray-900'>₹{data.price * data.quantity}</p>
                </div>
            </div>

            <div className='flex items-center gap-1'>


                <button className='px-2 py-1 hover:bg-gray-200 transition rounded-full cursor-pointer' onClick={() => decreaseQuantity(data.id, data.quantity)}><FaMinus size={10} /></button>
                <span className="font-bold text-xl">{data.quantity}</span>
                <button className='px-2 py-1 hover:bg-gray-200 transition rounded-full cursor-pointer' onClick={() => increaseQuantity(data.id, data.quantity)}><FaPlus size={10} /></button>

                <button className='p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 font-bold cursor-pointer' onClick={() => dispatch(removeCartItem({ itemId: data.id }))}>
                    <FaTrash size={18} />
                </button>

            </div>
        </div>
    )
}

export default CartItemCard
