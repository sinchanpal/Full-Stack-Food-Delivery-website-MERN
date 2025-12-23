import axios from 'axios';
import React, { useEffect } from 'react'
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';
import { useDispatch } from 'react-redux';



const UseGetUserShop = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchShop = async () => {

            try {
                const result = await axios.get(`${serverUrl}/api/shop/get-my-shop`, { withCredentials: true })
                dispatch(setMyShopData(result.data));
                console.log(result.data);
            } catch (error) {
                console.log("Error in UseGetUserShop", error);
            }

        }

        fetchShop(); //we call fetchUser in useEffect so when visit browser useEffect is called then under that fetchUser fun is called
    }, [])
}

export default UseGetUserShop
