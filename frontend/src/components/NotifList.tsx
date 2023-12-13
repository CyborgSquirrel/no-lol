import React, {useEffect, useState} from "react";
import {Button, Container, List, ListItem, Typography} from "@mui/material";
import {Colors} from "../assets/Colors";
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import {Navigate, useNavigate, useParams} from "react-router-dom";
import {User} from "../models/User";
import axios from "axios";

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

export function NotifList({userID, list, fetchNotifList}:
                              { userID: string, list: User[], fetchNotifList: (id: string) => unknown; }) {
    const [items, setItems] = useState(list || []);

    useEffect(() => {
        // update the component when the 'list' changes
        setItems(list || []);
    }, [list]);

    const handleAcceptClick = async (index: number) => {
        axios.put(`/friendship/accept`, {sender_id: index, receiver_id: parseInt(userID, 10)}).then(
            response => {
                fetchNotifList(userID);
                return response;
            }
        )
    };
    const handleRejectClick = async (index: number) => {
        // TODO: make put work
        axios.delete(`/friendship/remove`, {data: {sender_id: index, receiver_id: parseInt(userID)}}).then(
            response => {
                fetchNotifList(userID);
                return response;
            }
        )
    };

    return (
        <List sx={{
            backgroundColor: Colors.RICH_BLACK,
            borderRadius: "5px",
            border: `5px solid ${Colors.ULTRA_VIOLET}`,
            margin: "5px"
        }}>
            {items.length === 0 ? (
                <ListItem>
                    <Typography
                        style={{color: Colors.WHITE_BLUE}}
                        fontFamily={"Russo One"}
                    >No Requests</Typography>
                </ListItem>
            ) : (
                items.map((item, index) => (
                    <ListItem
                        sx={{
                            margin: "0",
                        }}
                        key={index}
                    >
                        <FriendRequest
                            user={userID}
                            other={item.id}
                            name={item.name}
                            onAccept={() => handleAcceptClick(item.id)}
                            onDecline={() => handleRejectClick(item.id)}
                        />
                    </ListItem>
                ))
            )}
        </List>
    )
}
