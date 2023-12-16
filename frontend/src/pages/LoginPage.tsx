import {
    Box,
    FormControl,
    TextField,
    InputLabel,
    Input,
    InputAdornment,
    IconButton,
    Button,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Colors } from "../assets/Colors";
import { Navigate, Link } from "react-router-dom";
import axios from "axios";
import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function LoginPage() {
    const [showPassword, setShowPassword] = React.useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        event.preventDefault();
    };
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loggedIn, setLoggedIn] = React.useState(false);
    const [userId, setUserId] = React.useState<number | undefined>();

    if (loggedIn) {
        return <Navigate to={`/profile/${userId}`} />;
    }

    const handleLogin = () => {
        const data = {
            name: username,
            password: password,
        };

        if (username === "" || password === "") {
            toast.warning("Username or Password can't be empty");
        } else {
            axios
                .post("/user/login", data)
                .then((response) => {
                    const userId = response.data.id;
                    setUserId(userId);
                    console.log("ID utilizator:", userId);

                    // go to ProfilePage
                    setLoggedIn(true);
                })
                .catch((error) => {
                    if (error.response) {
                        toast.error(error.response.data);
                    } else {
                        toast.error("Nu se poate conecta la server.");
                    }
                });
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                backgroundImage: `radial-gradient(75% 75% at 50% 50%, ${Colors.ISLE_BLUE} 0%, ${Colors.ULTRA_VIOLET} 100%)`,
                backgroundSize: "100% 100%",
                backgroundPosition: "0px 0px",
            }}
        >
            <Box
                sx={{
                    border: `1px solid ${Colors.WHITE_BLUE}`,
                    padding: "20px",
                    borderRadius: "4px",
                    textAlign: "center",
                    backgroundColor: Colors.ISLE_BLUE,
                }}
            >
                <div
                    style={{
                        color: Colors.WHITE_BLUE,
                        fontSize: "24px",
                        fontWeight: "bold",
                    }}
                >
                    Login
                </div>

                <br />

                <TextField
                    sx={{
                        width: "250px",
                        "& label": {
                            color: Colors.WHITE_BLUE,
                        },
                        "& .MuiInputBase-input": {
                            color: Colors.WHITE_BLUE,
                        },
                        "& label.Mui-focused": {
                            color: Colors.WHITE_BLUE,
                        },
                        "& .MuiInput-underline:before": {
                            borderBottomColor: Colors.WHITE_BLUE,
                        },
                        "& .MuiInput-underline:after": {
                            borderBottomColor: Colors.WHITE_BLUE,
                        },
                        "&:hover .MuiInput-underline:before": {
                            borderBottomColor: Colors.WHITE_BLUE,
                        },
                    }}
                    id="username"
                    label="Username"
                    type="search"
                    variant="standard"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <br />

                <FormControl
                    sx={{
                        m: 1,
                        width: "250px",
                        "& label": {
                            color: Colors.WHITE_BLUE,
                        },
                        "& .MuiInputBase-input": {
                            color: Colors.WHITE_BLUE,
                        },
                        "& label.Mui-focused": {
                            color: Colors.WHITE_BLUE,
                        },
                        "& .MuiInput-underline:before": {
                            borderBottomColor: Colors.WHITE_BLUE,
                        },
                        "& .MuiInput-underline:after": {
                            borderBottomColor: Colors.WHITE_BLUE,
                        },
                        "&:hover .MuiInput-underline:before": {
                            borderBottomColor: Colors.WHITE_BLUE,
                        },
                    }}
                    variant="standard"
                >
                    <InputLabel htmlFor="password">Password</InputLabel>
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                >
                                    {showPassword ? (
                                        <VisibilityOff />
                                    ) : (
                                        <Visibility />
                                    )}
                                </IconButton>
                            </InputAdornment>
                        }
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </FormControl>

                <br />

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-evenly",
                        margin: "10px 0",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Button
                        variant="outlined"
                        sx={{
                            width: "100px",
                            color: Colors.WHITE_BLUE,
                            borderColor: Colors.WHITE_BLUE,
                            "&:hover": { borderColor: Colors.WHITE_BLUE },
                        }}
                        onClick={handleLogin}
                    >
                        Login
                    </Button>

                    {/* Horizontal line */}
                    <hr style={{ width: "100%", border: "1px solid white" }} />

                    {/* Register text with hyperlink */}
                    <Box
                        sx={{
                            textAlign: "center",
                            marginTop: "10px",
                            color: Colors.WHITE_BLUE,
                        }}
                    >
                        No account?{" "}
                        <Link
                            to="/register"
                            style={{ color: Colors.WHITE_BLUE }}
                        >
                            Register here
                        </Link>
                        .
                    </Box>
                </Box>
            </Box>
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                theme={"colored"}
            />
        </Box>
    );
}

export default LoginPage;
