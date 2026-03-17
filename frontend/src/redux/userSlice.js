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
        myOrders: [], //this state is for store all orders of current user Or owners shop
        myOrderStatus: null,
        itemsBySearchBar: null, //here we store all the items related to user search query on search bar


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

        setCartItems: (state, action) => { //we use this reducer to empty the cartItems array after place order
            state.cartItems = action.payload;
        },

        setMyOrders: (state, action) => {
            state.myOrders = action.payload;
        },

        addMyOrders: (state, action) => { //we use this reducer cause : Bsically when we place a new order then the order is stored in our database backend but for get user orders on frontend side we need to call api and fetch all orders again from backend so instantly after placing order we can't see our new order in myOrders section unless we refresh the page .To avoid this we use this reducer to add the new order to top of myOrders array so now when we place a new order we can see it instantly in myOrders section without refresh 
            state.myOrders = [action.payload, ...state.myOrders];
        },

        updateMyOrderStatus: (state, action) => {  // we use this reducer to update the particular shopOrder status inside a particular user order in myOrders array when owner change the status of that shopOrder
            const { orderId, shopOrderId, status } = action.payload;

            const order = state.myOrders.find(o => o._id == orderId);

            if (order) {
                const shopOrder = order.shopOrders.find(so =>
                    so.shop._id == shopOrderId ||   // Matches if Shop is populated
                    so.shop == shopOrderId ||       // Matches if Shop is just a raw ID
                    so._id == shopOrderId);         // Matches if backend sent the Sub-document ID

                if (shopOrder) {
                    shopOrder.status = status;
                }

            }

        },

        setItemsBySearchBar: (state, action) => {
            state.itemsBySearchBar = action.payload;
        }


    }
})

export const { setUserData, setUserCity, setUserState, setUserAddress, setAllShopsInUserCity, setAllItemsInUserCity, addToCart, updateQuantity, removeCartItem, setMyOrders, addMyOrders, setCartItems, updateMyOrderStatus, setItemsBySearchBar } = userSlice.actions
export default userSlice.reducer