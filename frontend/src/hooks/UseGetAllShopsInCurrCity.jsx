import axios from 'axios';
import React, { useEffect } from 'react'
import { serverUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { setAllShopsInUserCity } from '../redux/userSlice';



const UseGetAllShopsInCurrCity = () => {
    const dispatch = useDispatch();
    const { userCity } = useSelector(state => state.user);

    useEffect(() => {
        const fetchShopsInCity = async () => {

            try {
                // If userCity is null, undefined, or empty "", STOP right here.
                if (!userCity) return;

                const result = await axios.get(`${serverUrl}/api/shop/get-all-shops-by-city/${userCity}`, { withCredentials: true });

                dispatch(setAllShopsInUserCity(result?.data)); 
                //console.log(result.data);
            } catch (error) {
                console.log("Error in UseGetAllShopsInCurrCity", error);
            }

        }

        fetchShopsInCity(); //we call fetchShopsInCity in useEffect so when visit browser useEffect is called then under that fetchShopsInCity fun is called
    }, [userCity, dispatch])
}

export default UseGetAllShopsInCurrCity
