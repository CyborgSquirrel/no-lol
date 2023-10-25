import reactLogo from './assets/react.svg'
import lolLogo from '/lol.svg'
import './App.css'
import {Box, Container, Link, Typography} from "@mui/material";

function App() {
    return (
        <Box className={"main-container"}>
            <Container sx={{display: "flex", flexDirection: "column", height: "100vh", justifyContent: "center", alignItems: "center"}}>
                <Typography variant={"h2"} textAlign={"center"}>Say NO to LoL!</Typography>
                <Box>
                    <Box display={"flex"} alignItems={"center"}>
                        <Link href="https://developer.riotgames.com/" target="_blank">
                            <img src={lolLogo} className="logo lol" alt="LoL logo"/>
                        </Link>
                        <Link href="https://reactjs.org" target="_blank">
                            <img src={reactLogo} className="logo react" alt="React logo"/>
                        </Link>
                    </Box>
                    <Typography variant={"h4"} textAlign={"center"}>Vite + React</Typography>
                    <Typography className="read-the-docs" textAlign={"center"}>
                        Click on the Vite and React logos to learn more
                    </Typography>
                </Box>
            </Container>
        </Box>
    )
}

export default App
