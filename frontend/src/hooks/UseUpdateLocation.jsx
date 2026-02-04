import axios from 'axios';
import React, { useEffect } from 'react'
import { serverUrl } from '../App';


//?This function will keep watching the user location and update it in backend whenever it changes

const UseUpdateLocation = () => {


    useEffect(() => {

        let watchId = null;// To store the ID so we can stop it later
        const updateLocation = async (latitude, longitude) => {

            try {
                const result = await axios.post(`${serverUrl}/api/user/update-location`, { latitude, longitude }, { withCredentials: true });

                console.log(result.data);
            } catch (error) {
                console.error("Error updating location:", error);
            }

        }


        if (navigator.geolocation) {

            navigator.geolocation.watchPosition(async (position) => { //this watchPosition will keep watching the position changes
                // console.log(position);
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                updateLocation(latitude, longitude);

            },
                (error) => console.log("Geo Error:", error),
                { enableHighAccuracy: true }) // Optional: better accuracy)
        }

        // 3. CRITICAL: Cleanup function.
        // This runs when the component unmounts. It stops the GPS tracker.
        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };


    }, [])

}

export default UseUpdateLocation
