import {useNavigate, useParams} from "react-router-dom";
import {Avatar, Box, Button, Container, List, ListItem, Popper, Typography, IconButton} from "@mui/material";
import {User} from "../models/User";
import {Loading} from "../components/Loading"
import {useQuery, useQueryClient} from "@tanstack/react-query";
import axios from "axios";
import {Colors} from "../assets/Colors";
import "../App.css"
import wave_mov from "../assets/wave_mov.svg"
import wave_blue from "../assets/wave_blue.svg"
import {DateTime} from "luxon";
import {BACKEND_API_URL} from "../constants";
import {Search, Group} from "@mui/icons-material";
import UserModal from "../pages/UserModal";
import {useEffect, useState} from "react";
import {NotifList} from "../components/NotifList";
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';

enum FriendshipState {
    Pending,
    Exists,
}

function ProfilePage() {
    const queryClient = useQueryClient();

    const params = useParams();
    const pageUserId = params.id;

    const loggedInUserId: undefined|string = sessionStorage.userId;

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);

    const navigate = useNavigate();

    // keep track of the notification list status
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

    // get request list for logged user
    const [requestList, setRequestList] = useState([])
    const fetchRequestList = async (id: string | undefined) => {
        const response = await axios.get(`user/by-id/${loggedInUserId}/friendship/pending`);
        const data = response.data.map((item: { sender: User }) => item.sender);
        setRequestList(data);
    };

    // get user data
    const userQuery = useQuery<User>({
        queryKey: ['userData', pageUserId, loggedInUserId],
        queryFn: async () => {
            let data: User = await axios.get(`user/by-id/${pageUserId}`)
                .then(response => response.data);

            // take create the request for the profile photo
            data.icon = `${BACKEND_API_URL}/icon/by-id/${data.profile.icon_id}`;

            // check if they are friends
            if (loggedInUserId !== undefined) {
                fetchRequestList(loggedInUserId);
            }

            return data;
        }
    });
    const user = userQuery.data;

    const friendshipQuery = useQuery<FriendshipState|null>({
        queryKey: ['userFriendship', pageUserId, loggedInUserId],
        queryFn: async () => {
            if (loggedInUserId !== undefined) {
                const response = await axios.get(`/user/by-id/${loggedInUserId}/friendship/with-user/by-id/${pageUserId}`);
                if (response.status === 200) {
                    const data = response.data;
                    if (data.pending !== undefined) {
                        if (data.pending) {
                            return FriendshipState.Pending;
                        } else {
                            return FriendshipState.Exists;
                        }
                    } else {
                        return null;
                    }
                }
            }
            return null;
        }
    });
    const friendshipState = friendshipQuery.data;

    useEffect(() => {
        if (user === undefined) return;

        // TODO: Handle case where last_match_end is null
        time(user.profile.last_match_end);
        const intervalId = setInterval(() => {
            time(user.profile.last_match_end)
        }, 10);

        return () => {
            clearInterval(intervalId);
        };
    }, [user]);

    if (userQuery.isPending || friendshipQuery.isPending || user === undefined) {
        return <Loading/>
    }

    if (userQuery.error) {
        throw userQuery.error;
    }

    if (friendshipQuery.error) {
        throw userQuery.error;
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
                        height: "27em",
                        rowGap: "4em",
                        borderRadius: "10px 10px 10px 10px",
                        backgroundColor: Colors.FOLLY,
                        boxShadow: "rgba(225,58,106, 0.4) 0px 5px, rgba(225,58,106, 0.3) 0px 10px, rgba(240, 46, 170, 0.2) 0px 15px, rgba(240, 46, 170, 0.1) 0px 20px, rgba(240, 46, 170, 0.05) 0px 25px"
                    }}
                >
                    {/*friend request button*/}
                    {loggedInUserId !== undefined && loggedInUserId !== pageUserId && friendshipState === null &&
                        <Button
                            sx={{
                                alignSelf: 'flex-start',
                                position: 'relative',
                                // marginTop: "40px",
                                top: "10px",
                                left: '0',
                                padding: '10px',
                                width: '60px',
                                backgroundColor: Colors.ISLE_BLUE,
                                color: "white",
                                borderRadius: '5px',
                                border: `3px solid ${Colors.ULTRA_VIOLET}`,
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: Colors.ULTRA_VIOLET,
                                },
                            }}
                            type="button"
                            onClick={async () => {
                                // @ts-ignore
                                await axios.post(`/friendship/create`, {sender_id: parseInt(loggedInUserId), receiver_id: parseInt(pageUserId)});
                                queryClient.invalidateQueries({ queryKey: ["userFriendship"] });
                            }}
                        >
                            <PersonAddIcon/>
                        </Button>
                    }

                    {/*friend remove button*/}
                    {loggedInUserId !== undefined && loggedInUserId !== pageUserId && friendshipState == FriendshipState.Exists &&
                        <Button
                            sx={{
                                alignSelf: 'flex-start',
                                position: 'relative',
                                // marginTop: "40px",
                                top: "10px",
                                left: '0',
                                padding: '10px',
                                width: '60px',
                                backgroundColor: Colors.ISLE_BLUE,
                                color: "white",
                                borderRadius: '5px',
                                border: `3px solid ${Colors.ULTRA_VIOLET}`,
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: Colors.ULTRA_VIOLET,
                                },
                            }}
                            type="button"
                            onClick={async () => {
                                // @ts-ignore
                                await axios.delete(`/friendship/remove`, {data: {sender_id: parseInt(loggedInUserId), receiver_id: parseInt(pageUserId)}});
                                queryClient.invalidateQueries({ queryKey: ["userFriendship"] });
                                queryClient.invalidateQueries({ queryKey: ["userSearch"] });
                            }}
                        >
                            <PersonRemoveIcon/>
                        </Button>}

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
                            src={user.icon}
                            sx={{
                                width: "8em",
                                height: "8em",
                                border: `1px solid ${Colors.WHITE_BLUE}`,
                                boxShadow: "0px 0px 22px 8px rgba(83,234,229,0.7)"
                            }}
                        />
                        <Tooltip title={user.name} arrow>
                            <Avatar
                                // TODO onclick
                                alt="ser"
                                src={user.icon}
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
                    >{user.name}</Typography>
                </Container>

                {/*notif button; show only on self profile page*/}
                {loggedInUserId === pageUserId
                ?
                (<><Button
                    sx={{
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
                    }}
                    type="button" onClick={openRequestList}
                >
                    <Badge
                        badgeContent={requestList.length}
                        sx={{
                            "& .MuiBadge-badge": {
                                color: Colors.WHITE_BLUE,
                                backgroundColor: Colors.FOLLY
                            }
                        }}
                    >
                        <PeopleIcon/>
                    </Badge>
                </Button>
                <Popper id={pid} open={open} anchorEl={anchorEl} placement={"bottom-end"}>
                    <NotifList
                    //@ts-ignore
                    userID={loggedInUserId} list={requestList} fetchNotifList={fetchRequestList}/>
                </Popper></>)

                // home button to return to self profile page
                :
                (<Button
                    sx={{
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
                    }}
                    type="button"
                    onClick={() => navigate(`/profile/${loggedInUserId}`)}
                >
                    <HomeIcon/>
                </Button>)}
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
            
            <IconButton
                onClick={() => setIsUserModalOpen(true)}
                sx={{
                    position: "absolute",
                    top: "20px",
                    right: "40px",
                    backgroundColor: Colors.WHITE_BLUE,
                    "&:hover": {
                        backgroundColor: Colors.FOLLY,
                    },
                }}
                title="Search by username"
            >
                <Search style={{ fontSize: 32, color: Colors.RICH_BLACK }} />
            </IconButton>
            <UserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} byName={true} userId={loggedInUserId}/>

            <IconButton
                onClick={() => setIsFriendsModalOpen(true)}
                sx={{
                    position: "absolute",
                    top: "20px",
                    right: "100px",
                    backgroundColor: Colors.WHITE_BLUE,
                    "&:hover": {
                        backgroundColor: Colors.FOLLY,
                    },
                }}
                title="Search"
            >
                <Group style={{ fontSize: 32, color: Colors.RICH_BLACK }} />
            </IconButton>
            <UserModal isOpen={isFriendsModalOpen} onClose={() => setIsFriendsModalOpen(false)} byName={false} userId={loggedInUserId}/>

        </Box>
    )
}

export default ProfilePage
