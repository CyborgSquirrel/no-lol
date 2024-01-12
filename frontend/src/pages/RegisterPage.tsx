import React from "react";
import {
    Box,
    FormControl,
    TextField,
    InputLabel,
    Input,
    InputAdornment,
    IconButton,
    Button,
    Select,
    MenuItem,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Colors } from "../assets/Colors";
import { Navigate, Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function RegisterPage() {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [retypePassword, setRetypePassword] = React.useState("");
    const [summonerName, setSummonerName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [region, setRegion] = React.useState("");

    const handleRegister = () => {
        const data = {
            name: username,
            password: password,
            summoner_name: summonerName,
            region: region,
            email: email,
        };

        if (
            username === "" ||
            email === "" ||
            password === "" ||
            retypePassword === "" ||
            summonerName === "" ||
            region === ""
        ) {
            toast.warning("All fields must be filled out.");
        } else if (password !== retypePassword) {
            toast.warning("Passwords do not match.");
        } else {
            axios
                .post("/user/register", data)
                .then((response) => {
                    console.log("Registration successful:", response.data);

                    // Redirect to the home page
                    return <Navigate to={"/"} />;
                })
                .catch((error) => {
                    if (error.response) {
                        if (error.response.data.name_already_exists) {
                            toast.error("Username already exists!");
                        } else if (
                            error.response.data.summoner_already_exists
                        ) {
                            toast.error("Summoner already exists!");
                        } else if (
                            error.response.data.email_already_exists
                        ) {
                            toast.error("Email already exists!");
                        } else {
                            toast.error(error.response.data);
                        }
                    } else {
                        toast.error("Unable to connect to the server.");
                    }
                });
        }
    };

    const regions = [
        "NA",
        "EUW",
        "EUNE",
        "KR",
        "BR",
        "JP",
        "RU",
        "OCE",
        "TR",
        "LAN",
        "LAS",
        "PH",
        "SG",
        "TH",
        "TW",
        "VN",
    ];

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
                    Register
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
                    id="summonerName"
                    label="Summoner Name"
                    type="search"
                    variant="standard"
                    value={summonerName}
                    onChange={(e) => setSummonerName(e.target.value)}
                />

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
                    id="email"
                    label="Email"
                    type="email"
                    variant="standard"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                        type={"password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </FormControl>

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
                    <InputLabel htmlFor="retypePassword">
                        Retype Password
                    </InputLabel>
                    <Input
                        id="retypePassword"
                        type="password"
                        value={retypePassword}
                        onChange={(e) => setRetypePassword(e.target.value)}
                    />
                </FormControl>

                <br />

                <FormControl
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
                >
                    <InputLabel htmlFor="region">Region</InputLabel>
                    <Select
                        id="region"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                    >
                        {regions.map((regionOption) => (
                            <MenuItem key={regionOption} value={regionOption}>
                                {regionOption}
                            </MenuItem>
                        ))}
                    </Select>
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
                        onClick={handleRegister}
                    >
                        Register
                    </Button>

                    <hr style={{ width: "100%", border: "1px solid white" }} />

                    <Box
                        sx={{
                            textAlign: "center",
                            marginTop: "10px",
                            color: Colors.WHITE_BLUE,
                        }}
                    >
                        Already have an account?{" "}
                        <Link to="/" style={{ color: Colors.WHITE_BLUE }}>
                            Login here
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

export default RegisterPage;
