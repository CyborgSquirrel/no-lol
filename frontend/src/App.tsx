import './App.css';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import ProfilePage from "./pages/ProfilePage";
import {Box, Container} from "@mui/material";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import {Colors} from "./assets/Colors";
import React from "react";
import LoginPage from "./pages/LoginPage";
import axios from "axios";

const queryClient = new QueryClient();


function App() {
    axios.defaults.baseURL = "http://127.0.0.1:5000";

    return (
        // <QueryClientProvider client={queryClient}>
        //     <Box sx = {{
        //         position: "absolute",
        //         top: 0,
        //         left: 0,
        //         width: "100vw",
        //         height: "100vh",
        //         backgroundColor: Colors.RICH_BLACK,
        //         padding: "0",
        //         margin: "0"
        //     }}
        //     >
        //         <ProfilePage/>
        //     </Box>
        //
        // </QueryClientProvider>

        <BrowserRouter>
            <Routes>
                <Route path={"/"} element={<LoginPage/>}></Route>
                <Route path={"/profile/:id"} element={
                    <QueryClientProvider client={queryClient}>
                        <Box sx = {{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            backgroundColor: Colors.RICH_BLACK,
                            padding: "0",
                            margin: "0"
                        }}>
                            <ProfilePage/>
                        </Box>

                    </QueryClientProvider>
                }></Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App;
