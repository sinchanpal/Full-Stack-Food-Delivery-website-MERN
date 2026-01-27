import axios from 'axios';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setUserAddress, setUserCity, setUserState } from '../redux/userSlice';
import { setAddress, setLocation } from '../redux/mapSlice';

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

                dispatch(setLocation({lon:longitude , lat:latitude}));  //?here we pass lon and lat to mapSlice for location

                //! here we use api from geoapify website to find city using latitude longitude
                const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${API_Key}`);

                // console.log(result);
                // console.log(result.data.results[0].city);
                let city = result?.data?.results[0]?.city;
                let state = result?.data?.results[0]?.state;
                let address = result?.data?.results[0]?.address_line2;

                //we store our city to userCity and state to userState and address to userAddress in redux store
                dispatch(setUserCity(city));
                dispatch(setUserState(state));
                dispatch(setUserAddress(address));

                dispatch(setAddress(address)); //here we pass the address to mapSlice 

            })
        }, [userData,dispatch]) //means this useEffect is called on userData change
    )
}

export default UseGetCity
