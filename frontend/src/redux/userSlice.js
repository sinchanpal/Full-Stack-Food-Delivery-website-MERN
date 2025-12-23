import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        userCity: null,
        userState: null,
        userAddress: null
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
        },
        setUserCity: (state, action) => {
            state.userCity = action.payload;
        },
        setUserState: (state, action) => {
            state.userState = action.payload;
        },
        setUserAddress: (state, action) =>{
            state.userAddress = action.payload;
        }


    }
})

export const { setUserData, setUserCity, setUserState , setUserAddress } = userSlice.actions
export default userSlice.reducer