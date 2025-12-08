import { configureStore } from "@reduxjs/toolkit";
import userReducer from './userSlice'

export const store = configureStore({
    reducer:{
        user: userReducer, //now we can access all the states of userSlice using the user
    }
})