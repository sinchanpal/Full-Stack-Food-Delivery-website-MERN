import { createSlice } from "@reduxjs/toolkit";

const mapSlice = createSlice({
    name: "map",
    initialState: {
        location: {
            lon: null,  //here we store longitude of the location
            lat: null   //here we store latitude of the location
        },
        address: null   //here we store the address 
    },
    reducers: {
        setLocation: (state, action) => {
            const { lon, lat } = action.payload;
            state.location.lon = lon;
            state.location.lat = lat;
        },

        setAddress: (state, action) => {
            state.address = action.payload
        }


    }
})

export const { setLocation, setAddress } = mapSlice.actions
export default mapSlice.reducer