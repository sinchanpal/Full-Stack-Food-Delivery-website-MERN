import axios from 'axios';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setUserCity } from '../redux/userSlice';

const UseGetCity = () => {

    const dispatch = useDispatch();
    const API_Key = import.meta.env.VITE_GEOAPIFY_API_KEY;
    const { userData } = useSelector(state => state.user);
    return (
        useEffect(() => {

            navigator.geolocation.getCurrentPosition(async (position) => {
                // console.log(position);
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                //! here we use api from geoapify website to find city using latitude longitude
                const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${API_Key}`);

                // console.log(result);
                // console.log(result.data.results[0].city);
                let city = result?.data?.results[0]?.city;
               
                //we store our city to userCity in redux store
                dispatch(setUserCity(city));

            })
        }, [userData]) //means this useEffect is called on userData change
    )
}

export default UseGetCity
