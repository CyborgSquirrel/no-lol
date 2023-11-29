import {Container, Typography} from "@mui/material";
import {Colors} from "../assets/Colors";
import {isRouteErrorResponse, useRouteError} from "react-router-dom";
import {isAxiosError} from "axios";

function ErrorPage() {
    let error = useRouteError();

    if (isRouteErrorResponse(error)) {
        return (
            <Container maxWidth={false} sx={{
                display: "flex",
                height: "100vh",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 6,
                backgroundColor: Colors.RICH_BLACK,
            }}>
                <Typography variant={"h2"} color={Colors.FOLLY}>Oops!</Typography>
                <Typography variant={"h4"}>Sorry, an unexpected error has occurred.</Typography>
                <Typography variant={"h6"} color={Colors.ISLE_BLUE}>{error.statusText || error.data}</Typography>
            </Container>
        );
    }

    if (isAxiosError(error)) {
        return (
            <Container maxWidth={false} sx={{
                display: "flex",
                height: "100vh",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 6,
                backgroundColor: Colors.RICH_BLACK,
            }}>
                <Typography variant={"h2"} color={Colors.FOLLY}>Oops!</Typography>
                <Typography variant={"h4"}>Sorry, an unexpected error has occurred.</Typography>
                <Typography variant={"h6"} color={Colors.ISLE_BLUE}>{error.response!.statusText || error.response!.data}</Typography>
            </Container>
        );
    }

    return (
        <Container sx={{
            display: "flex",
            height: "100vh",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Colors.RICH_BLACK,
        }}>
            <Typography variant={"h2"}>Oops!</Typography>
            <Typography variant={"h4"}>Sorry, an unexpected error has occurred.</Typography>
        </Container>
    );
}

export default ErrorPage;