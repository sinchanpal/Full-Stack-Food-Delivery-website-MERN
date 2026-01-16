import React, { useState } from 'react'
import { FaLeaf } from "react-icons/fa";
import { GiChickenLeg } from "react-icons/gi";
import { FaStar } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/userSlice';

//! I have to check this file later 
//TODO I have to work on it
const ItemCard = ({ item }) => {

    const dispatch = useDispatch();
    const { cartItems } = useSelector(state => state.user);

    const [quantity, setQuantity] = useState(0);

    const increaseQuantity = () => {
        const newQty = quantity + 1;
        setQuantity(newQty);
    }

    const decreaseQuantity = () => {
        const newQty = quantity - 1;
        setQuantity((newQty < 0) ? 0 : newQty); //if newQty is less than 0 then set to 0 else set the new decreased quantity
    }

    const addItemtoCart = () => {  //here we dispatch the item data to addToCart reducer in redux store 

        if(quantity>0){ //means if we select quantity atleast 1 then only addToCart works

            dispatch(addToCart({
            id: item._id,
            name: item.name,
            image: item.image,
            shop: item.shop,
            price: item.price,
            foodType: item.foodType,
            quantity
        }))

        }
        
    }


    const renderStars = (rating) => {

        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<FaStar key={i} className='text-yellow-500 text-lg' />);
            }
            else {
                stars.push(<FaRegStar key={i} className='text-yellow-500 text-lg' />);
            }
        }
        return stars;
    }




    return (
        <div className='w-40 h-[200px] md:w-[200px] md:h-[250px] rounded-2xl border-2 border-[#ff4d2d] shrink-0 overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 relative cursor-pointer flex flex-col group'>

            {/* Item Image and food type section */}
            <div className='relative w-full h-[65%] overflow-hidden'>

                <div className='absolute top-3 right-3 bg-white rounded-full p-1 shadow'>
                    {item.foodType === "veg" ? <FaLeaf className='text-green-600 text-xs md:text-sm' /> : <GiChickenLeg className='text-red-600 text-xs md:text-sm' />}
                </div>

                <img src={item.image} alt={item.name} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' />
            </div>

            {/* food description section */}
            <div className='flex flex-1 flex-col justify-center p-3 bg-white'>
                <h1 className='font-bold text-gray-800 text-lg truncate'>{item.name}</h1>

                {/* display stars */}
                <div className='flex items-center gap-1 mt-1'>
                    {renderStars(item.rating?.average || 0)} {/*here we send average rating from item model  */}
                    <span className='text-gray-600 text-sm'>({item.rating.count})</span>

                </div>
            </div>

            {/* display price and quantity controls*/}
            <div className='flex items-center justify-between mt-auto p-3'>
                <span className='font-bold text-gray-900 text-lg'>
                    ₹{item.price}
                </span>


                <div className='flex items-center border rounded-full overflow-hidden shadow-sm'>
                    <button className='px-2 py-1 hover:bg-gray-100 transition cursor-pointer' onClick={decreaseQuantity}><FaMinus size={10} /></button>
                    <span>{quantity}</span>
                    <button className='px-2 py-1 hover:bg-gray-100 transition cursor-pointer' onClick={increaseQuantity}><FaPlus size={10} /></button>
                    <button className={`${cartItems.some(i => i.id == item._id) ? "bg-gray-700" : "bg-[#ff4d2d]"} text-white px-3 py-2 transition-colors cursor-pointer`} onClick={addItemtoCart}> 
                        <FaShoppingCart />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ItemCard
