import {useParams} from "react-router-dom";
import {Avatar, Box, Container, Typography} from "@mui/material";
import {User} from "../models/User";
import {Loading} from "../components/Loading"
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {Colors} from "../assets/Colors";
import "../App.css"
import wave_mov from "../assets/wave_mov.svg"
import wave_blue from "../assets/wave_blue.svg"


function ProfilePage() {

    const { userId } = useParams();

    const { isPending, error, data } = useQuery<User>({
        queryKey: ['userData'],
        queryFn: async () => { // TODO create request
            return {
                id: 1,
                name: "Mathe Dracusorul thau",
                photo: "",
                time: "00:00:00"
            }
        },
        initialData: {
            id: 1,
            name: "Mathe Dracusorul thau",
            photo: "",
            time: "00:00:00"
        }
    })

    if (isPending)
        return <Loading/>

    if (error) { // @ts-ignore
        return <p>An error has occurred: {error.message}</p>
    }

    return (
        <>
            <Box
                sx = {{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "30em",
                }}
            >
            <Container
                sx = {{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width:"80vw",
                    height: "25em",
                    rowGap: "4em",
                    borderRadius: "10px 10px 10px 10px",
                    backgroundColor: Colors.FOLLY,
                    // backgroundImage: `url(${image})`,
                    boxShadow: "rgba(225,58,106, 0.4) 0px 5px, rgba(225,58,106, 0.3) 0px 10px, rgba(240, 46, 170, 0.2) 0px 15px, rgba(240, 46, 170, 0.1) 0px 20px, rgba(240, 46, 170, 0.05) 0px 25px"
                }}
            >
                <Avatar
                    alt="ser"
                    src={data.photo}
                    sx={{
                        width: "8em",
                        height: "8em",
                        boxShadow: "0px 0px 22px 8px rgba(83,234,229,0.7)"
                    }}
                />
                <Typography
                    fontFamily={"Russo One"}
                    variant="h3"
                    color={Colors.WHITE_BLUE}
                >{data.name}</Typography>
            </Container>
        </Box>

            <Container sx={{
                marginTop: "5em",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width:"80vw",
                height: "10em",
                rowGap: "4em",
            }}
            >
                <Typography
                    fontFamily={"Russo One"}
                    variant="h4"
                    color={Colors.WHITE_BLUE}
                >Hours happier:</Typography>
                <Typography
                    fontFamily={"Russo One"}
                    variant="h2"
                    color={Colors.WHITE_BLUE}
                >{data.time}</Typography>
            </Container>

            <Box sx={{
                height: "10em",
                width: "100vw",
                position: "absolute",
                bottom: 0,
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "flex-end",
                rowGap: "0",
                zIndex: "1"
            }}>
                <img style={{ width: "20%"}} src={wave_mov}/>
                <img style={{ width: "20%"}} src={wave_mov}/>
                <img style={{ width: "20%"}} src={wave_mov}/>
                <img style={{ width: "20%"}} src={wave_mov}/>
                <img style={{ width: "20%"}} src={wave_mov}/>
            </Box>
            <Box sx={{
                height: "10em",
                width: "100vw",
                position: "absolute",
                bottom: 0,
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "flex-end",
                rowGap: "0"
            }}>
                <img style={{ width: "25%"}} src={wave_blue}/>
                <img style={{ width: "25%"}} src={wave_blue}/>
                <img style={{ width: "25%"}} src={wave_blue}/>
                <img style={{ width: "25%"}} src={wave_blue}/>
            </Box>
        </>


)
}
export default ProfilePage