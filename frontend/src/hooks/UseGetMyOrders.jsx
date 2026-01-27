import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setMyOrders} from '../redux/userSlice'

const UseGetMyOrders = () => {

    const dispatch = useDispatch();
    useEffect(() => {
        const fetchOrders = async () => {

            try {
                const result = await axios.get(`${serverUrl}/api/order/my-orders`, { withCredentials: true })
                dispatch(setMyOrders(result?.data));
                console.log(result?.data)
            } catch (error) {
                console.log("Error in UseGetMyOrders",error);
            }

        }

        fetchOrders(); //we call fetchOrders in useEffect so when visit browser useEffect is called then under that fetchOrders fun is called
    }, [])
}

export default UseGetMyOrders
