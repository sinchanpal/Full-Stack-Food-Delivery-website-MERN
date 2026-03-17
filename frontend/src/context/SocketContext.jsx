import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { serverUrl } from "../App";
import { io } from "socket.io-client";

// 1. Create the Context
const SocketContext = createContext();

// 2. Create a custom hook so components can easily grab the socket instance
export const useSocketContext = () => {
    return useContext(SocketContext);
}


// 3. Create the Provider that will wrap your app
export const SocketContextProvider = ({children})=>{
    const [socket,setSocket]=useState(null); // We will store the socket instance in this state
    const {userData} = useSelector(state=>state.user);


    useEffect(()=>{
        if(userData){
            // User is logged in, create the socket connection!
            const socketInstance = io(serverUrl,{withCredentials: true});
            setSocket(socketInstance); // Store the socket instance in state

            socketInstance.on("connect",()=>{
                socketInstance.emit("identity",{userId: userData._id}); // Emit the identity event with user ID when connected
            });

            // Cleanup when component unmounts or user logs out
            return ()=>{
                socketInstance.disconnect(); // Disconnect the socket to avoid memory leaks
            };
        }else{
            // If user logs out, disconnect and clear the socket
            if(socket){
                socket.disconnect();
                setSocket(null); // Clear the socket instance from state
            }
        }
    },[userData]); // Re-run this effect whenever userData changes (login/logout)

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};