import { createSlice } from "@reduxjs/toolkit";

//TODO check this file
const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        userCity: null,
        userState: null,
        userAddress: null,
        allShopsInUserCity: null,
        allItemsInUserCity: null,
        cartItems: [],  //here we create cartItems state like this cause when we addtoCart a item then we get the particullar item .And from that item we take this fields and store here. 
        // Also here we get our data in this format {id: null, name: null,  image: null, shop: null, price: null,  foodType: null,quantity: null}
        totalCartAmount: 0, //this state is for store total amount of user cart
        myOrders: null //this state is for store all orders of current user Or owners shop

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
        setUserAddress: (state, action) => {
            state.userAddress = action.payload;
        },
        setAllShopsInUserCity: (state, action) => {
            state.allShopsInUserCity = action.payload;
        },
        setAllItemsInUserCity: (state, action) => {
            state.allItemsInUserCity = action.payload;
        },
        addToCart: (state, action) => {
            const cartItem = action.payload; //1st we get the partocular cartItem which we just dispatch
            const existingItem = state.cartItems.find(i => i.id == cartItem.id); //now check if the current cartItem id matches any of the cartItem id exist in the cartItems array then take the whole item 

            if (existingItem) { //if 'yes' then just increase the quantity no need to add this Item in cartItems separetlly
                existingItem.quantity += cartItem.quantity;
            } else { //if 'No' then  add this Item in cartItems separetlly
                state.cartItems.push(cartItem);
            }

            state.totalCartAmount = state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0); //here we calculate the total amount of cart whenever we add a new item to cart or update quantity of existing item in cart. reduce function is usefull to change in a single variable here we change the total value . initial value of total is 0 . we go through each item in cartItems calculate each item price with its quantity then add it to total value
        },

        updateQuantity: (state, action) => {
            const { itemId, quantity } = action.payload;
            const item = state.cartItems.find(i => i.id == itemId);

            if (item) {
                item.quantity = quantity;
            }

            state.totalCartAmount = state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0); //same way we calculate total for updateQuantity
        },

        removeCartItem: (state, action) => {
            const { itemId } = action.payload;
            state.cartItems = state.cartItems.filter(i => i.id !== itemId);

            state.totalCartAmount = state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0); //same way we calculate total for removeCart item
        },

        setMyOrders: (state, action) => {
            state.myOrders = action.payload;
        }


    }
})

export const { setUserData, setUserCity, setUserState, setUserAddress, setAllShopsInUserCity, setAllItemsInUserCity, addToCart, updateQuantity, removeCartItem, setMyOrders } = userSlice.actions
export default userSlice.reducer