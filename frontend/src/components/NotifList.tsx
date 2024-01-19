import {Button, List, ListItem, Typography} from "@mui/material";
import {Colors} from "../assets/Colors";
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {useQueryClient} from "@tanstack/react-query";
import {useNotificationsQuery} from "../common";

// @ts-ignore
function FriendRequest({user, other, name, onAccept, onDecline}) {
    const navigate = useNavigate();

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px',
                borderBottom: `1px solid ${Colors.ISLE_BLUE}`,
                width: "400px"
            }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: "left",
                    justifyContent: "left",
                    color: Colors.WHITE_BLUE,
                    fontFamily: "Russo One"
                }}>
                <a
                    href="#"
                    style={{textDecoration: 'none', color: 'inherit'}}
                    onClick={(e) => {
                        e.preventDefault();
                        navigate(`/profile/${user}/${other}`);
                    }}
                >
                    {name}
                </a>
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: "right",
                    alignItems: "right",
                    gap: '10px',
                }}>
                <Button
                    sx={{
                        padding: '8px',
                        cursor: 'pointer',
                        backgroundColor: Colors.ISLE_BLUE,
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                    onClick={onAccept}>
                    <CheckIcon/>
                </Button>
                <Button
                    sx={{
                        padding: '8px',
                        cursor: 'pointer',
                        backgroundColor: Colors.FOLLY,
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                    onClick={onDecline}>
                    <CloseIcon/>
                </Button>
            </div>
        </div>
    );

}

// @ts-ignore
function BuddyRequest({user, other, name, onAccept, onDecline}) {
    const navigate = useNavigate();

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px',
                borderBottom: `1px solid ${Colors.ISLE_BLUE}`,
                width: "400px"
            }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: "left",
                    justifyContent: "left",
                    color: Colors.WHITE_BLUE,
                    fontFamily: "Russo One"
                }}>
                <a
                    href="#"
                    style={{textDecoration: 'none', color: 'inherit'}}
                    onClick={(e) => {
                        e.preventDefault();
                        navigate(`/profile/${user}/${other}`);
                    }}
                >
                    Buddy: {name}
                </a>
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: "right",
                    alignItems: "right",
                    gap: '10px',
                }}>
                <Button
                    sx={{
                        padding: '8px',
                        cursor: 'pointer',
                        backgroundColor: Colors.ISLE_BLUE,
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                    onClick={onAccept}>
                    <CheckIcon/>
                </Button>
                <Button
                    sx={{
                        padding: '8px',
                        cursor: 'pointer',
                        backgroundColor: Colors.FOLLY,
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                    onClick={onDecline}>
                    <CloseIcon/>
                </Button>
            </div>
        </div>
    );

}

export function NotifList({userID}: { userID: string }) {
    const queryClient = useQueryClient();

    const notificationsQuery = useNotificationsQuery(userID);
    const notificationsList = notificationsQuery.data;

    const handleAcceptClick = async (index: number) => {
        await axios.put(`/friendship/accept`, {sender_id: index, receiver_id: parseInt(userID, 10)});
        queryClient.invalidateQueries({queryKey: ["notificationList", userID]});
        queryClient.invalidateQueries({queryKey: ["userSearch"]});
    };
    const handleRejectClick = async (index: number) => {
        // TODO: make put work
        await axios.delete(`/friendship/remove`, {data: {sender_id: index, receiver_id: parseInt(userID)}});
        queryClient.invalidateQueries({queryKey: ["notificationList", userID]});
        queryClient.invalidateQueries({queryKey: ["userSearch"]});
    };

    const handleAcceptBuddyReqClick = async (index: number) => {
        await axios.put(`/buddy/accept`, {sender_id: index, receiver_id: parseInt(userID, 10)});
        queryClient.invalidateQueries({queryKey: ["notificationList", userID]});
        queryClient.invalidateQueries({queryKey: ["userSearch"]});
    };
    const handleRejectBuddyReqClick = async (index: number) => {
        // TODO: make put work
        await axios.delete(`/buddy/remove`, {data: {sender_id: index, receiver_id: parseInt(userID)}});
        queryClient.invalidateQueries({queryKey: ["notificationList", userID]});
        queryClient.invalidateQueries({queryKey: ["userSearch"]});
    };

    return (
        <List sx={{
            backgroundColor: Colors.RICH_BLACK,
            borderRadius: "5px",
            border: `5px solid ${Colors.ULTRA_VIOLET}`,
            margin: "5px"
        }}>
            {notificationsList.length === 0 ? (
                <ListItem>
                    <Typography
                        style={{color: Colors.WHITE_BLUE}}
                        fontFamily={"Russo One"}
                    >No Requests</Typography>
                </ListItem>
            ) : (
                notificationsList.map((item, index) => (
                    <ListItem
                        sx={{
                            margin: "0",
                        }}
                        key={index}
                    >
                        {
                            item.kind === "pending_friendship"
                                ?
                                (
                                    <FriendRequest
                                        user={userID}
                                        other={item.content.id}
                                        name={item.content.name}
                                        onAccept={() => handleAcceptClick(item.content.id)}
                                        onDecline={() => handleRejectClick(item.content.id)}
                                    />
                                )
                                :
                                item.kind === "pending_buddyship"
                                    ?
                                    (
                                        <BuddyRequest
                                            user={userID}
                                            other={item.content.id}
                                            name={item.content.name}
                                            onAccept={() => handleAcceptBuddyReqClick(item.content.id)}
                                            onDecline={() => handleRejectBuddyReqClick(item.content.id)}
                                        />
                                    )
                                    :
                                    null
                        }
                    </ListItem>
                ))
            )}
        </List>
    )
}
