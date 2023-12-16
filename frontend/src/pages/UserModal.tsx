import {User} from "../models/User";
import {BACKEND_API_URL} from "../constants";
import {Link} from "react-router-dom";
import {Avatar, Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography} from "@mui/material";
import {Colors} from "../assets/Colors";
import {useState} from "react";
import axios from "axios";
import {HighlightOffRounded} from "@mui/icons-material";

function UserListInterface(user: User) {
    let icon = `${BACKEND_API_URL}/icon/by-id/${user.profile.icon_id}`;

    const handleClick = () => {
        setTimeout(() => window.location.reload(), 0);
    };

    return (
        <Link to={{ pathname: `/profile/${user.id}`}} key={user.id} onClick={handleClick}>
            <Box key={user.id}
                 sx={{
                     display: 'flex',
                     alignItems: 'center',
                     gap: '8px',
                     borderColor: Colors.FOLLY,
                     borderStyle: "solid",
                     borderWidth: "1px",
                     marginBottom: "10px",
                     padding: "10px",
                     borderRadius: "35px",
                     marginRight: "5px",
                 }}>
                <Avatar
                    alt=""
                    src={icon}
                    sx={{
                        width: "2em",
                        height: "2em",
                        marginRight: "10px",
                    }}
                />
                <Typography
                    fontFamily={"Russo One"}
                    variant="caption"
                    fontSize={"20px"}
                    color={Colors.FOLLY}
                >{user.name}</Typography>
            </Box>
        </Link>
    );
}
interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    byName: boolean; // true for searched by name, else false
    userId ?: string;
}
function UserModal({ isOpen, onClose, byName, userId }:SearchModalProps) {
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const title = byName ? 'Search (by name)' : 'Search (in friend list)';
    const label = byName ? 'Search' : 'Search your friends';

    const handleSearchChange = (event: { target: { value: any; }; }) => {
        const newValue = event.target.value;
        setSearchText(newValue);

        const searchEndpoint = byName ? `/users?name=${newValue}`
                                            : `/users?friend_of=${userId}&name=${newValue}`;
        if (newValue) {
            axios.get(searchEndpoint).then(response => setSearchResults(response.data))
        } else {
            setSearchResults([]);
        }
    };

    if(!isOpen && searchText !== '') {
        setSearchText('');
        setSearchResults([]);
    }

    return (
        <Dialog open={isOpen} onClose={onClose} PaperProps={{
            style: {
                borderRadius: "20px",
                borderColor: Colors.FOLLY,
                borderStyle: "solid",
                borderWidth: "0.5px",
                backgroundColor: Colors.RICH_BLACK,
                color: Colors.FOLLY,
                minWidth: "400px",
                minHeight: "300px",
            },
        }}>
            <DialogTitle sx={{
                fontSize: "25px",
                fontFamily: "Russo One",
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: "16px 10px 16px 24px",
            }}>
                {title}
                <DialogActions>
                    <HighlightOffRounded onClick={onClose}></HighlightOffRounded>
                </DialogActions>
            </DialogTitle>
            <DialogContent sx={{
                padding: "0px 15px 20px 20px",
            }}
            >
                <TextField
                    sx={{
                        width: '350px',
                        marginBottom: "20px",
                        marginTop: "5px",
                        '& label': {
                            color: Colors.FOLLY,
                            fontFamily: "Russo One",
                        },
                        '& .MuiInputBase-input': {
                            color: Colors.FOLLY,
                            fontFamily: "Russo One",
                        },
                        '& label.Mui-focused': {
                            color: Colors.FOLLY,
                            fontFamily: "Russo One",
                        },
                        '& .MuiInput-underline:before': {
                            borderBottomColor: Colors.FOLLY,
                            fontFamily: "Russo One",
                        },
                        '& .MuiInput-underline:after': {
                            borderBottomColor: Colors.FOLLY,
                            fontFamily: "Russo One",
                        },
                        '&:hover .MuiInput-underline:before': {
                            borderBottomColor: Colors.FOLLY,
                            fontFamily: "Russo One",
                        },
                        '& .MuiOutlinedInput-root': {
                            // style for border
                            '& fieldset': {
                                borderColor: Colors.FOLLY,
                            },
                            '&:hover fieldset': {
                                borderColor: Colors.FOLLY,
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: Colors.FOLLY,
                            },
                        }
                    }}
                    label={label}
                    type="search"
                    autoComplete={"off"}
                    value={searchText}
                    onChange={handleSearchChange}/>

                <DialogContent sx={{
                    overflowY: 'auto',
                    maxHeight: '300px',
                    padding: "10px 10px 10px 0px",
                    margin: "0px",
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: Colors.FOLLY,
                        borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: 'transparent',
                    },
                }}>
                    {searchResults.map(user => (
                        UserListInterface(user)
                    ))}
                </DialogContent>
            </DialogContent>
        </Dialog>
    );
}

export default UserModal;