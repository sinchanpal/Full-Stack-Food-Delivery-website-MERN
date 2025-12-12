import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        userCity: null,
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
        },
        setUserCity: (state, action) => {
            state.userCity = action.payload;
        }

    }
})

export const { setUserData, setUserCity } = userSlice.actions
export default userSlice.reducer