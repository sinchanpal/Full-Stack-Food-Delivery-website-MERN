import User from "../models/userModel.js";
export const userSocketMap = {}

//first we have to install socket.io using npm install socket.io in our backend folder
export const socketHandler = (io) => {


    io.on("connection", (socket) => { //connection is a built-in event in socket.io that is triggered whenever a new client connects to the server. When a client establishes a connection with the server,

        // console.log("A user connected with socket id : ", socket.id);

        socket.on('identity', async ({ userId }) => {  //we listen for a custom event called 'identity' that we will emit from the frontend when the user logs in or opens the app. This event will carry the userId of the connected user, which we can then use to update their socketId and online status in the database.
            try {
                userSocketMap[userId] = socket.id; //we store the mapping of userId and socketId in an object called userSocketMap. This will help us to easily get the socketId of any user when we want to send them a notification.

                await User.findByIdAndUpdate(userId, {
                    isOnline: true,
                })

            } catch (error) {
                console.log("Error in socket identity", error);
            }
        })

        //? Delivery Boy Location -> Customer
        socket.on('update-deliveryBoy-location',(data)=>{
            // data will contain: { customerId, lat, lon }
            const customerSocketId = userSocketMap[data.customerId];  //we find the socketId of the customer 

            if(customerSocketId){
                // Instantly forward the exact coordinates to that specific customer
                io.to(customerSocketId).emit('deliveryBoy-location-update',{
                    lat: data.lat,
                    lon: data.lon
                });
            }
        });


        socket.on('disconnect', async () => { //disconnect is a built-in event in socket.io that is triggered whenever a client disconnects from the server, whether it's due to closing the browser, losing internet connection, or any other reason. When this event occurs, we want remove the entry for this user from our userSocketMap

            try {
                const userId = Object.keys(userSocketMap).find(key => userSocketMap[key] === socket.id); //we find the userId corresponding to the disconnected socketId by searching through our userSocketMap.

                if (userId) {

                    delete userSocketMap[userId]; //we remove the entry for this user from our userSocketMap since they are now disconnected.

                    await User.findByIdAndUpdate(userId, {
                        isOnline: false,
                    })
                }
            } catch (error) {
                console.log("Error in socket disconnect", error);
            }

        })

    })
}