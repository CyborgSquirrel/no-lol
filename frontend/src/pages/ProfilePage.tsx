import {useNavigate, useParams} from "react-router-dom";
import {Avatar, Box, Button, Container, Popper, Typography, IconButton} from "@mui/material";
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
import {Search, Group, Diversity3, GroupAdd, GroupRemove} from "@mui/icons-material";
import UserModal from "../pages/UserModal";
import {useEffect, useState} from "react";
import {NotifList} from "../components/NotifList";
import HomeIcon from '@mui/icons-material/Home';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import Tooltip from '@mui/material/Tooltip';
import { useBuddyQuery, useNotificationsQuery } from "../common";

enum FriendshipState {
    Pending,
    Exists,
    PendingBuddy,
    Buddies,
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

    const notificationsQuery = loggedInUserId === undefined ? undefined : useNotificationsQuery(loggedInUserId);
    const notificationsList = notificationsQuery === undefined ? undefined : notificationsQuery.data;

    // calculate period since last played
    const [period, setPeriod] = useState("")

    function time(unix: number) {
        let date = DateTime.fromSeconds(unix);
        let now = DateTime.now().setZone("system")
        setPeriod(now.diff(date, ['minutes', 'seconds', "hours", "days"]).toFormat("dd : hh : mm : ss"))
    }

    // get user data
    const userQuery = useQuery<User>({
        queryKey: ['userData', pageUserId, loggedInUserId],
        queryFn: async () => {
            const response = await axios.get(`user/by-id/${pageUserId}`);
            if(response.status === 200){
                const data = response.data;
                data.icon = `${BACKEND_API_URL}/icon/by-id/${data.profile.icon_id}`;
                return data;
            } else {
                return null;
            }
        }
    });

    const pageBuddyQuery = pageUserId === undefined ? undefined : useBuddyQuery(pageUserId);
    const myBuddyQuery = loggedInUserId === undefined ? undefined : useBuddyQuery(loggedInUserId);

    const user = userQuery.data;
    const pageBuddy = pageBuddyQuery?.data;
    const myBuddy = myBuddyQuery?.data;

    const friendshipQuery = useQuery<FriendshipState|null>({
        queryKey: ['userFriendship', pageUserId, loggedInUserId],
        queryFn: async () => {
            if (loggedInUserId !== undefined) {
                const response = await axios.get(`/user/by-id/${loggedInUserId}/friendship/with-user/by-id/${pageUserId}`);
                if (response.status === 200) {
                    const data = response.data;
                    console.log(data);
                    if (data.pending !== undefined) {
                        if (data.pending) {
                            return FriendshipState.Pending;
                        } else if (data.pending_buddy) {
                            return FriendshipState.PendingBuddy;
                        } else if (data.buddies) {
                            return FriendshipState.Buddies;
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
    console.log(friendshipState);

    useEffect(() => {
        if (user === undefined) return;

        // TODO: Handle case where last_match_end is null
        if(user.profile.last_match_end != null) {
            time(user.profile.last_match_end);
        } else {
            let currentDate = DateTime.now().setZone("system");
            //console.log(currentDate.toSeconds());
            time(currentDate.toSeconds());
        }
        const intervalId = setInterval(() => {
            if (user.profile.last_match_end != null) {
                time(user.profile.last_match_end);
            }
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

    // @ts-ignore
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
                        <Tooltip title={"Friend request"}>
                            <Button
                                sx={{
                                    alignSelf: 'flex-start',
                                    position: 'absolute',
                                    top: "50px",
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
                                <Diversity3/>
                            </Button>
                        </Tooltip>
                    }

                    {/*friend remove button*/}
                    {loggedInUserId !== undefined && loggedInUserId !== pageUserId && friendshipState == FriendshipState.Exists &&
                        <Tooltip title={"Friend remove"}>
                            <Button
                                sx={{
                                    alignSelf: 'flex-start',
                                    position: 'absolute',
                                    top: "50px",
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
                                <GroupRemove/>
                            </Button>
                        </Tooltip>
                    }

                    {/*buddy request button*/}
                    {loggedInUserId !== undefined && loggedInUserId !== pageUserId && friendshipState == FriendshipState.Exists && pageBuddy === null && myBuddy === null &&
                        <Tooltip title={"Buddy request"}>
                            <Button
                                sx={{
                                    alignSelf: 'flex-start',
                                    position: 'absolute',
                                    top: "50px",
                                    marginLeft: "75px",
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
                                    console.log("Buton apasat");
                                    // @ts-ignore
                                    await axios.post(`/buddy/create`, {sender_id: parseInt(loggedInUserId), receiver_id: parseInt(pageUserId)});
                                    queryClient.invalidateQueries({ queryKey: ["buddyUser"] });
                                }}
                            >
                                <PersonAddIcon/>
                            </Button>
                        </Tooltip>
                    }

                    {/*buddy remove button*/}
                    {loggedInUserId !== undefined && pageBuddy !== null && pageBuddy?.id === parseInt(loggedInUserId) &&
                        <Tooltip title={"Buddy remove"}>
                            <Button
                                sx={{
                                    alignSelf: 'flex-start',
                                    position: 'absolute',
                                    top: "50px",
                                    marginLeft: "75px",
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
                                    await axios.delete(`/buddy/remove`, {data: {sender_id: parseInt(loggedInUserId), receiver_id: parseInt(pageUserId)}});
                                    queryClient.invalidateQueries({ queryKey: ["buddyUser"] });
                                    queryClient.invalidateQueries({ queryKey: ["userSearch"] });
                                    queryClient.invalidateQueries({ queryKey: ["buddyData"] });
                                    queryClient.invalidateQueries({ queryKey: ["userFriendship"] });
                                }}
                            >
                                <PersonRemoveIcon/>
                            </Button>
                        </Tooltip>
                    }

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
                        {
                            pageBuddy !== undefined && pageBuddy !== null ? (
                                <Tooltip title={pageBuddy.name} arrow>
                                <Avatar
                                    alt="ser"
                                    src={pageBuddy.icon}
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
                            ) : null
                        }
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
                    (<><IconButton
                        onClick={openRequestList}
                        sx={{
                            position: "absolute",
                            top: "65px",
                            right: "70px",
                            backgroundColor: Colors.WHITE_BLUE,
                            "&:hover": {
                                backgroundColor: Colors.FOLLY,
                            },
                        }}
                        title="Requests"
                    >
                        <GroupAdd style={{ fontSize: 32, color: Colors.RICH_BLACK }} />
                    </IconButton>
                <Popper id={pid} open={open} anchorEl={anchorEl} placement={"bottom-end"}>
                    <NotifList
                    //@ts-ignore
                    userID={loggedInUserId}/>
                </Popper></>)

                // home button to return to self profile page
                :
                    (<IconButton
                        onClick={() => navigate(`/profile/${loggedInUserId}`)}
                        sx={{
                            position: "absolute",
                            top: "65px",
                            right: "70px",
                            backgroundColor: Colors.WHITE_BLUE,
                            "&:hover": {
                                backgroundColor: Colors.FOLLY,
                            },
                        }}
                        title="Home"
                    >
                        <HomeIcon style={{ fontSize: 32, color: Colors.RICH_BLACK }} />
                    </IconButton>)}

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
                >Time since relapse:</Typography>
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
