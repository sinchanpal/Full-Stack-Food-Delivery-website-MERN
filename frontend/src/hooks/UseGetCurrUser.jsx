import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

const UseGetCurrUser = () => {

    const dispatch = useDispatch();
    useEffect(() => {
        const fetchUser = async () => {

            try {
                const result = await axios.get(`${serverUrl}/api/user/current-user`, { withCredentials: true })
                dispatch(setUserData(result?.data?.currUser));
                console.log(result?.data?.currUser)
            } catch (error) {
                console.log("Error in UseGetCurrUser",error);
            }

        }

        fetchUser(); //we call fetchUser in useEffect so when visit browser useEffect is called then under that fetchUser fun is called
    }, [])
}

export default UseGetCurrUser
