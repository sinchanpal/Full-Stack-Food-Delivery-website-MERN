import React from 'react'
import 'leaflet/dist/leaflet.css'; // <--- CRITICAL: Map won't look right without this!
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
// 2. ICON FIX (Standard React-Leaflet fix for missing icons)
import L from 'leaflet';
import homeIcon from '../assets/home.png'
import DBIcon from '../assets/deliveryBoy.png'
// 1. IMPORT LEAFLET COMPONENTS & CSS
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';

let deliveryBoyIcon = new L.Icon({
    iconUrl: DBIcon,
    shadowUrl: iconShadow,
    iconSize: [50, 50],
    iconAnchor: [12, 41]
});

let customerHomeIcon = new L.Icon({
    iconUrl: homeIcon,
    shadowUrl: iconShadow,
    iconSize: [40, 40],
    iconAnchor: [12, 41]
});



const DeliveryBoyTracking = ({ data }) => {

    const deliveryBoyLat = data?.deliveryBoyLocation?.lat;
    const deliveryBoyLon = data?.deliveryBoyLocation?.lon;

    const customerLat = data?.customerLocation?.lat;
    const customerLon = data?.customerLocation?.lon;

    const path = [  //this is used for creating a straight line between customer and deliveryboy
        [deliveryBoyLat, deliveryBoyLon],
        [customerLat, customerLon]
    ]

    const mapCenter = [deliveryBoyLat, deliveryBoyLon];  //we define delivery boy location as  map center
    return (
        <div className='w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md'>
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

                {/* 5. THE MARKER (Only show if we have a valid location) */}

                <Marker position={[deliveryBoyLat, deliveryBoyLon]} icon={deliveryBoyIcon} >
                    <Popup>
                        Delivery Boy
                    </Popup>
                </Marker>

                <Marker position={[customerLat, customerLon]} icon={customerHomeIcon} >
                    <Popup>
                        Customer Home
                    </Popup>
                </Marker>

                {/* This makes a stright line between 2 markers */}
                <Polyline positions={path} color='blue' weight={4}/>

            </MapContainer>
        </div>
    )
}

export default DeliveryBoyTracking
