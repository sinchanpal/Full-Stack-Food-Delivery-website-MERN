import axios from 'axios';
import React, { useEffect } from 'react'
import { serverUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { setAllItemsInUserCity } from '../redux/userSlice';



const UseGetAllitemsInCity = () => {
    const dispatch = useDispatch();
    const { userCity } = useSelector(state => state.user);

    useEffect(() => {
        const fetchItemsInCity = async () => {

            try {

                // If the city is not loaded yet, STOP here. Do not call the API.
                if (!userCity) return;

                const result = await axios.get(`${serverUrl}/api/item/get-all-items-in-city/${userCity}`, { withCredentials: true });
                console.log(result?.data);
                dispatch(setAllItemsInUserCity(result?.data)); 

            } catch (error) {
                console.log("Error in setAllItemsInUserCity", error);
            }

        }

        fetchItemsInCity(); //we call fetchItemsInCity in useEffect so when visit browser useEffect is called then under that fetchItemsInCity fun is called
    }, [userCity, dispatch])
}

export default UseGetAllitemsInCity
