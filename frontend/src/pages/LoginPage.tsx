// daca response == 200 atunci iau idUser
// else eroare
import {Box, FormControl, TextField, InputLabel, Input, InputAdornment, IconButton, Button, Alert, AlertTitle} from "@mui/material";
import {Visibility, VisibilityOff} from '@mui/icons-material';
import {Colors} from "../assets/Colors";
import axios from "axios";
import React from "react";

function LoginPage(){
    const [showPassword, setShowPassword] = React.useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [warning, setWarning] = React.useState('');


    const handleLogin = () => {

        const data = {
            name: username,
            password: password,
        };

        if(username === "" || password === ""){
            setWarning("Username or Password can't be empty");
            setTimeout(() => {
                setWarning('');
            }, 5000);
        } else {
            axios.post('/user/login', data)
                .then((response) => {
                    const userID = response.data.userID;
                    console.log('ID utilizator:', userID);

                    // go to ProfilePage
                    window.location.href = '/profile';
                })
                .catch((error) => {
                    if (error.response) {
                        setError(error.response.data);
                    } else {
                        setError("Nu se poate conecta la server.");
                    }
                    setTimeout(() => {
                        setError('');
                    }, 5000);
                });
        }
    };



    return(
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundImage: `radial-gradient(75% 75% at 50% 50%, ${Colors.ISLE_BLUE} 0%, ${Colors.ULTRA_VIOLET} 100%)`,
                backgroundSize: '100% 100%',
                backgroundPosition: '0px 0px',
            }}
        >
            <Box
                sx={{
                    border: `1px solid ${Colors.WHITE_BLUE}`,
                    padding: '20px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    backgroundColor: Colors.ISLE_BLUE
                }}
            >
                <div style={{color: Colors.WHITE_BLUE, fontSize: '24px', fontWeight: 'bold'}}>Login</div>

                <br/>

                <TextField
                    sx={{
                        width: '250px',
                        '& label': {
                            color: Colors.WHITE_BLUE,
                        },
                        '& .MuiInputBase-input': {
                            color: Colors.WHITE_BLUE,
                        },
                        '& label.Mui-focused': {
                            color: Colors.WHITE_BLUE,
                        },
                        '& .MuiInput-underline:before': {
                            borderBottomColor: Colors.WHITE_BLUE,
                        },
                        '& .MuiInput-underline:after': {
                            borderBottomColor: Colors.WHITE_BLUE,
                        },
                        '&:hover .MuiInput-underline:before': {
                            borderBottomColor: Colors.WHITE_BLUE,
                        },
                    }}
                    id= "username"
                    label= "Username"
                    type= "search"
                    variant= "standard"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <br/>

                <FormControl
                    sx={{
                        m: 1,
                        width: '250px',
                        '& label': {
                            color: Colors.WHITE_BLUE,
                        },
                        '& .MuiInputBase-input': {
                            color: Colors.WHITE_BLUE,
                        },
                        '& label.Mui-focused': {
                            color: Colors.WHITE_BLUE,
                        },
                        '& .MuiInput-underline:before': {
                            borderBottomColor: Colors.WHITE_BLUE,
                        },
                        '& .MuiInput-underline:after': {
                            borderBottomColor: Colors.WHITE_BLUE,
                        },
                        '&:hover .MuiInput-underline:before': {
                            borderBottomColor: Colors.WHITE_BLUE,
                        },
                    }} variant="standard">
                        <InputLabel htmlFor="password">Password</InputLabel>
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                </FormControl>

                <br/>

                <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-evenly',
                        margin: '10px 0',
                    }}
                >
                    <Button variant="outlined"
                            sx={{
                                width: '100px',
                                color: Colors.WHITE_BLUE,
                                borderColor: Colors.WHITE_BLUE,

                                '&:hover': {borderColor: Colors.WHITE_BLUE}
                            }}
                            onClick={handleLogin}
                    >
                        Login
                    </Button>
                </Box>
            </Box>
            {warning && (
                <Alert
                    variant="filled"
                    severity="warning"
                    sx={{
                        position: 'absolute',
                        bottom: '20px',
                        right: '20px',
                    }}
                >
                    <AlertTitle>Warning</AlertTitle>
                    <strong>{warning}</strong>
                </Alert>
            )}
            {error && (
                <Alert
                    variant="filled"
                    severity="error"
                    sx={{
                        position: 'absolute',
                        bottom: '20px',
                        right: '20px',
                    }}
                >
                    <AlertTitle>Error</AlertTitle>
                    <strong>{error}</strong>
                </Alert>
            )}
        </Box>

    )
}

export default LoginPage