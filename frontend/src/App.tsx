import './App.css';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import ProfilePage from "./pages/ProfilePage";
import {Box, Container} from "@mui/material";
import {Colors} from "./assets/Colors";
import React from "react";
import axios from "axios";

const queryClient = new QueryClient();

function App() {
    axios.defaults.baseURL = "http://127.0.0.1:5000";

    return (
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
            }}
            >
                <ProfilePage/>
            </Box>

        </QueryClientProvider>
    )
}

export default App;
