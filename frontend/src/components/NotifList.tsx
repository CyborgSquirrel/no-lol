import {useState} from "react";
import {Button, Container, List, ListItem, Typography} from "@mui/material";
import {Colors} from "../assets/Colors";
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

// @ts-ignore
function FriendRequest({name, onAccept, onDecline}) {
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
                }}>{name}</div>
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

export function NotifList() {
    const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3']);
    const handleItemClick = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
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
                            name={item}
                            onAccept={() => handleItemClick(index)}
                            onDecline={() => handleItemClick(index)}
                        />
                    </ListItem>
                ))
            )}
        </List>
    )
}
