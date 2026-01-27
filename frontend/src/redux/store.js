import { configureStore } from "@reduxjs/toolkit";
import userReducer from './userSlice'
import ownerReducer from './ownerSlice'
import mapReducer from './mapSlice'

export const store = configureStore({
    reducer: {
        user: userReducer, //now we can access all the states of userSlice using the user
        owner: ownerReducer, //now we can access all the states of ownerSlice using the owner
        map: mapReducer  //now we can access all the states of mapSlice using the map
    }
})