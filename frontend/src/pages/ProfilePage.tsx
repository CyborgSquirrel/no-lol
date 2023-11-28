import {useParams} from "react-router-dom";
import {Avatar, Box, Button, Container, List, ListItem, Popper, Typography} from "@mui/material";
import {User} from "../models/User";
import {Loading} from "../components/Loading"
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {Colors} from "../assets/Colors";
import "../App.css"
import wave_mov from "../assets/wave_mov.svg"
import wave_blue from "../assets/wave_blue.svg"
import {DateTime} from "luxon";
import {useState} from "react";
import {NotifList} from "../components/NotifList";
import PeopleIcon from '@mui/icons-material/People';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';

function ProfilePage() {

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openRequestList = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const open = Boolean(anchorEl);
    const pid = open ? 'simple-popper' : undefined;


    // calculate period since last played
    const [period, setPeriod] = useState("")

    function time(unix: number) {
        let date = DateTime.fromSeconds(unix);
        let now = DateTime.now().setZone("system")
        setPeriod(now.diff(date, ['minutes', 'seconds', "hours", "days"]).toFormat("dd : hh : mm : ss"))
    }

    // get user data
    const {id} = useParams();
    const {isPending, error, data} = useQuery<User>({
        queryKey: ['userData'],
        queryFn: async () => {
            let data: User = await axios.get(`user/by-id/2`)
                .then(response => response.data)

            data.icon = `http://127.0.0.1:5000/icon/by-id/${data.profile.icon_id}`;

            // TODO: Handle case where last_match_end is null
            time(data.profile.last_match_end)
            setInterval(() => {
                time(data.profile.last_match_end)
            }, 10)

            return data
        }
    })

    if (isPending)
        return <Loading/>

    if (error) { // @ts-ignore
        return <p>An error has occurred: {error.message}</p>
    }

    return (
        <Box sx={{
            height: "100vh",
            width: "100vw",
            backgroundColor: Colors.RICH_BLACK,
            overflow: "scroll",
        }}>
            <Box
                sx={{
                    position: 'relative',
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "bottom",
                    height: "30em",
                }}
            >
                {/*pink container*/}
                <Container
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "80vw",
                        height: "25em",
                        rowGap: "4em",
                        borderRadius: "10px 10px 10px 10px",
                        backgroundColor: Colors.FOLLY,
                        boxShadow: "rgba(225,58,106, 0.4) 0px 5px, rgba(225,58,106, 0.3) 0px 10px, rgba(240, 46, 170, 0.2) 0px 15px, rgba(240, 46, 170, 0.1) 0px 20px, rgba(240, 46, 170, 0.05) 0px 25px"
                    }}
                >
                    {/*personal and inger pazitor photo*/}
                    <Container
                        sx={{
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center"
                        }}
                    >
                        <Avatar
                            alt="ser"
                            src={data.icon}
                            sx={{
                                width: "8em",
                                height: "8em",
                                border: `1px solid ${Colors.WHITE_BLUE}`,
                                boxShadow: "0px 0px 22px 8px rgba(83,234,229,0.7)"
                            }}
                        />
                        <Tooltip title={data.name} arrow>
                            <Avatar
                                // TODO onclick
                                alt="ser"
                                src={data.icon}
                                sx={{
                                    position: "absolute",
                                    bottom: "0",
                                    right: "40%",
                                    width: "3em",
                                    height: "3em",
                                    border: `2px solid ${Colors.WHITE_BLUE}`,
                                }}
                            />
                        </Tooltip>
                    </Container>

                    <Typography
                        fontFamily={"Russo One"}
                        variant="h3"
                        color={Colors.WHITE_BLUE}
                    >{data.name}</Typography>
                </Container>

                {/*notif button*/}
                <Button sx={{
                    position: 'absolute',
                    marginTop: "40px",
                    top: "0",
                    right: '50px',
                    padding: '10px',
                    width: '60px',
                    backgroundColor: Colors.RICH_BLACK,
                    color: Colors.WHITE_BLUE,
                    borderRadius: '5px',
                    border: `3px solid ${Colors.ULTRA_VIOLET}`,
                    cursor: 'pointer',
                    '&:hover': {
                        backgroundColor: Colors.ISLE_BLUE,
                    },
                }} aria-describedby={id} type="button" onClick={openRequestList}>
                    <Badge
                        // TODO give number of requests
                        badgeContent={1}
                        sx={{
                            "& .MuiBadge-badge": {
                                color: Colors.WHITE_BLUE,
                                backgroundColor: Colors.FOLLY
                            }
                        }}>
                        <PeopleIcon/>
                    </Badge>
                </Button>
                <Popper id={pid} open={open} anchorEl={anchorEl} placement={"bottom-end"}>
                    <NotifList
                        // TODO give list from request as param along with functions to be called
                    />
                </Popper>

            </Box>

            <Container sx={{
                marginTop: "5em",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width: "80vw",
                height: "10em",
                rowGap: "4em",
            }}
            >
                <Typography
                    fontFamily={"Russo One"}
                    variant="h4"
                    color={Colors.WHITE_BLUE}
                >Time happier:</Typography>
                <Typography
                    fontFamily={"Russo One"}
                    variant="h2"
                    color={Colors.WHITE_BLUE}
                >{period}</Typography>
            </Container>

            <Box sx={{
                height: "5em",
                bottom: 0
            }}>
                <Box sx={{
                    height: "10em",
                    width: "100vw",
                    bottom: 0,
                    position: "absolute",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    rowGap: "0",
                    zIndex: "1"
                }}>
                    <img style={{width: "20%"}} src={wave_mov}/>
                    <img style={{width: "20%"}} src={wave_mov}/>
                    <img style={{width: "20%"}} src={wave_mov}/>
                    <img style={{width: "20%"}} src={wave_mov}/>
                    <img style={{width: "20%"}} src={wave_mov}/>
                </Box>
                <Box sx={{
                    height: "10em",
                    width: "100vw",
                    bottom: 0,
                    display: "flex",
                    position: "absolute",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    rowGap: "0"
                }}>
                    <img style={{width: "25%"}} src={wave_blue}/>
                    <img style={{width: "25%"}} src={wave_blue}/>
                    <img style={{width: "25%"}} src={wave_blue}/>
                    <img style={{width: "25%"}} src={wave_blue}/>
                </Box>
            </Box>
        </Box>
    )
}

export default ProfilePage