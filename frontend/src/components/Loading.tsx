import {Box, LinearProgress} from "@mui/material";

export function Loading() {
    return (
        <Box
            sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <LinearProgress sx = {{
                width: "50em"
            }}/>
        </Box>
    )
}