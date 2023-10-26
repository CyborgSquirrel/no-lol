import reactLogo from './assets/react.svg'
import lolLogo from '/lol.svg'
import './App.css'
import {Box, Button, Container, Link, Typography} from "@mui/material";
import {HealthAndSafetyOutlined} from '@mui/icons-material';
import {cyan, teal} from "@mui/material/colors";
import {create} from "zustand";

interface Store {
    curedPlayers: number
    cure: () => void
}

const useStore = create<Store>()((set) => ({
    curedPlayers: 0,
    cure: () => set((state) => ({curedPlayers: state.curedPlayers + 1}))
}));

function App() {
    const {curedPlayers, cure} = useStore();

    return (
        <Box className={"main-container"}>
            <Container sx={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Typography variant={"h2"} textAlign={"center"}>Say NO to LoL!</Typography>
                <Typography variant={"h5"} textAlign={"center"}>Cured Players: {curedPlayers}</Typography>
                <br/>
                <Box>
                    <Button
                        variant={"contained"}
                        sx={{background: cyan[500], borderRadius: "5em", ":hover": {background: teal[400]}}}
                        startIcon={<HealthAndSafetyOutlined sx={{color: "#b31212"}}/>}
                        onClick={() => cure()}
                    >
                        Cure
                    </Button>
                </Box>
                <br/>

                <Box>
                    <Box display={"flex"} alignItems={"center"}>
                        <Link href="https://developer.riotgames.com/" target="_blank">
                            <img src={lolLogo} className="logo lol" alt="LoL logo"/>
                        </Link>
                        <Link href="https://reactjs.org" target="_blank">
                            <img src={reactLogo} className="logo react" alt="React logo"/>
                        </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    )
}

export default App
