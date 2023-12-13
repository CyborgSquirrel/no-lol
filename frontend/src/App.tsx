import './App.css';
import axios from "axios";
import React from "react";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Box} from "@mui/material";
import {Colors} from "./assets/Colors";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import ErrorPage from "./pages/ErrorPage";
import {BACKEND_API_URL} from "./constants";
import OtherProfilePage from "./pages/OtherProfilePage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <LoginPage/>,
        errorElement: <ErrorPage/>
    },
    {
        path: "/profile/:logged",
        element: (
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
        ),
        errorElement: <ErrorPage/>
    },
    {
        path: "/profile/:logged/:other",
        element: (
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
                <OtherProfilePage/>
            </Box>
        ),
        errorElement: <ErrorPage/>
    }
]);

function App() {
    // set the backend url
    axios.defaults.baseURL = BACKEND_API_URL;

    // create a React Query client instance
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router}/>
        </QueryClientProvider>
    );
}

export default App;
