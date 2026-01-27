//TODO I have to complete this page 

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoMdArrowRoundBack } from "react-icons/io";
import { MdLocationOn } from "react-icons/md";
import { IoIosSearch } from "react-icons/io";
import { TbCurrentLocation } from "react-icons/tb";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdDeliveryDining } from "react-icons/md";
import { MdOutlinePhoneIphone } from "react-icons/md";
import { IoCard } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';

// 1. IMPORT LEAFLET COMPONENTS & CSS
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // <--- CRITICAL: Map won't look right without this!

// 2. ICON FIX (Standard React-Leaflet fix for missing icons)
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { setAddress, setLocation } from '../redux/mapSlice';
import axios from 'axios';
import { serverUrl } from '../App';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;


// --- HELPER COMPONENT: Recenter Automatically ---
// This invisible component watches "center" and flies the map there smoothly
const RecenterMap = ({ center }) => {
    const map = useMap(); // Access the map instance

    useEffect(() => {
        if (center) {
            // "flyTo" creates the smooth animation
            map.flyTo(center, map.getZoom(), {
                animate: true,
                duration: 1 // Speed of the flight (in seconds)
            });

        }
    }, [center, map]);

    return null; // This component doesn't render anything visible
}





const CheckOut = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const API_Key = import.meta.env.VITE_GEOAPIFY_API_KEY;

    // Assuming 'location' has { lat: ..., lon: ... } inside it
    const { location, address } = useSelector(state => state.map);


    // Default center if redux has no location yet (e.g., Default to Kolkata or India center)
    const defaultCenter = [22.5726, 88.3639];
    const mapCenter = location && location.lat ? [location.lat, location.lon] : defaultCenter;


    const [searchAddress, setSearchAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cod");

    const { cartItems, totalCartAmount } = useSelector(state => state.user);


    let deliveryFee = totalCartAmount > 500 ? 0 : 40; //if cart amount greater than 500 then delivery free else 40rs
    let foodGST = Math.round(totalCartAmount * 0.05); //5% gst on food items


    // If you drag the pin, the input box should update to show the new street name
    useEffect(() => {

        if (address) {
            setSearchAddress(address);
        }
    }, [address]);




    //this function search address using geoapify api 
    const handleSearchAddress = async () => {
        if (!searchAddress) {
            alert("Please enter an address to search");
            return;
        }

        try {

            // Call API: "Search by Text" (Forward Geocoding)
            const result = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchAddress)}&format=json&apiKey=${API_Key}`);

            // console.log(result);

            const { lat, lon } = result?.data?.results[0];
            const foundAddress = result?.data?.results[0]?.formatted;

            if (lat && lon) {
                dispatch(setLocation({ lat: lat, lon: lon }));
                dispatch(setAddress(foundAddress));
            } else {
                alert("Location not found!");
            }

        } catch (error) {
            console.log("Search Error:", error);
        }
    }



    //get address from lat lon using geoapify api
    const getAddressFromLatLon = async (lat, lon) => {

        try {

            //! here we use api from geoapify website to find city using latitude longitude
            const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${API_Key}`);


            let newAddress = result?.data?.results[0]?.address_line2;

            // console.log(address);

            if (newAddress) {
                dispatch(setAddress(newAddress));
            } //here we pass the address to mapSlice

        } catch (error) {
            console.log("Error fetching address:", error);
        }
    }




    // Handler for when the marker is dragged to a new location
    const onDragend = (e) => {
        // console.log(e.target._latlng);
        const { lat, lng } = e.target._latlng;  //from dragend marker we get the new lat lng and store it to redux
        dispatch(setLocation({ lat: lat, lon: lng }));
        getAddressFromLatLon(lat, lng); //fetch address from new lat lon
    }




    //Function that recenter map to user current location
    const backToCenterLocation = () => {

        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            // console.log(position);
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            dispatch(setLocation({ lon: longitude, lat: latitude }));  //?here we pass lon and lat to mapSlice for location
            getAddressFromLatLon(latitude, longitude); //fetch address from new lat lon

        }, (error) => {
            console.log("Error getting location:", error);
            alert("Unable to retrieve your location");
        })
    }


    const handlePlaceOrder = async () => {
        try {
            const result = await axios.post(`${serverUrl}/api/order/place-order`, {
                cartItems,
                paymentMethod,
                address: {
                    text: address,
                    latitude: location.lat,
                    longitude: location.lon
                },
                totalCartAmount
            }, { withCredentials: true });

            console.log("Order Placed Successfully", result.data);
            navigate('/order-placed')
        } catch (error) {
            console.log("Error while place order: ", error);
        }
    }


    return (
        <div className='min-h-screen bg-[#fff9f6] flex items-center justify-center p-6'>
            <div className='absolute top-5 left-5 z-10 mb-2'>

                {/* Back Button on click we navigate to home page */}
                <IoMdArrowRoundBack size={45} className='text-[#ff4d2d] cursor-pointer' onClick={() => navigate('/cart')} />
            </div>

            <div className='w-full max-w-[900px] bg-white rounded-2xl shadow-2xl p-6 space-y-6'>
                <h1 className='text-2xl font-bold text-gray-800 flex '>Checkout<IoMdCheckmarkCircleOutline size={20} className='text-green-500 font-bold' /></h1>


                {/* Map Section  */}
                <section>
                    <h2 className='text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800'><MdLocationOn className='text-[#ff4d2d]' size={19} /> Delivery Location</h2>

                    <div className='flex gap-2 mb-3'>
                        <input type="text" className='flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]' placeholder='Enter Your Delivery Location' value={searchAddress} onChange={(e) => setSearchAddress(e.target.value)} />

                        <button className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-3 py-2 rounded-lg flex items-center justify-center cursor-pointer' onClick={handleSearchAddress}><IoIosSearch size={22} /></button>

                        <button className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center cursor-pointer' onClick={backToCenterLocation}><TbCurrentLocation size={22} /></button>
                    </div>

                    <div className='rounded-2xl border overflow-hidden'>
                        <div className='h-64 w-full flex items-center justify-center'>
                            {/* 3. THE MAP CONTAINER */}

                            <MapContainer
                                center={mapCenter}
                                zoom={13}
                                scrollWheelZoom={true}
                                className='w-full h-full'

                            >
                                {/* 4. THE TILE LAYER (The map skin) */}
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />


                                {/* INSERT THE SMOOTH MOVER HERE. This invisible component watches your Redux location and commands the map to "fly" there smoothly whenever it changes.*/}
                                <RecenterMap center={mapCenter} />


                                {/* 5. THE MARKER (Only show if we have a valid location) */}
                                {location && location.lat && (
                                    <Marker position={[location.lat, location.lon]} draggable={true} eventHandlers={{ dragend: onDragend }}>
                                        <Popup>
                                            {address || "Your Delivery Location"}
                                        </Popup>
                                    </Marker>
                                )}
                            </MapContainer>
                        </div>
                    </div>
                </section>


                {/* Payment Method Section */}
                <section>
                    <h2 className='text-lg font-semibold mb-3 text-gray-800'>Payment Method</h2>

                    <div className='grid grid-col-1 sm:grid-cols-2 gap-4'>

                        {/* Cash on delivery section */}
                        <div className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${paymentMethod === "cod" ? "border-[#ff4d2d] bg-orange-50 shadow" : "border-gray-200 hover:border-gray-300"}`} onClick={() => setPaymentMethod("cod")}>
                            <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100'>
                                <MdDeliveryDining className='text-green-600 text-xl' />
                            </span>

                            <div>
                                <p className='font-medium text-gray-800'>Cash On Delivery</p>
                                <p className='text-xs text-gray-500'>Pay when your food arrives</p>
                            </div>
                        </div>

                        {/* Online section */}
                        <div className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${paymentMethod === "online" ? "border-[#ff4d2d] bg-orange-50 shadow" : "border-gray-200 hover:border-gray-300"}`} onClick={() => setPaymentMethod("online")}>

                            <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100'>
                                <MdOutlinePhoneIphone className='text-purple-600 text-xl' />
                            </span>
                            <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100'>
                                <IoCard className='text-blue-600 text-xl' />
                            </span>

                            <div>
                                <p className='font-medium text-gray-800'>UPI / Credit / Debit Card</p>
                                <p className='text-xs text-gray-500'>Pay Securely Online</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Order Summary section*/}
                <section>
                    <h2 className='text-lg font-semibold mb-3 text-gray-800'>Order Summary</h2>

                    <div className='rounded-xl border bg-gray-50 p-4 space-y-2'>
                        {cartItems.map((item, index) => (
                            <div key={index} className='flex justify-between text-sm text-gray-700'>
                                <span>{item.name} : ₹{item.price} X {item.quantity}</span>
                                <span> ₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                        <hr className='border-gray-400 my-2' />

                        {/* Payment Details  */}

                        <div className='flex justify-between font-medium text-gray-800'>
                            <span>Subtotal</span>
                            <span>₹{totalCartAmount}</span>
                        </div>

                        <div className='flex justify-between font-medium text-gray-800'>
                            <span>Food GST Fee</span>
                            <span>₹{foodGST}</span>
                        </div>

                        <div className='flex justify-between font-medium text-gray-800'>
                            <span>Delivery Fee</span>
                            <span>₹{deliveryFee == 0 ? "Free" : deliveryFee}</span>
                        </div>

                        <div className='flex justify-between font-bold text-lg text-[#ff4d2d] mt-2'>
                            <span>Total</span>
                            <span>₹{totalCartAmount + foodGST + deliveryFee}</span>
                        </div>

                    </div>

                </section>

                {/* Order button */}
                <button className='w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 rounded-xl font-semibold' onClick={handlePlaceOrder}>{paymentMethod == "cod" ? "Place Order" : "Pay & Place Order"}</button>
            </div>
        </div>
    )
}

export default CheckOut
