import {
    Box,
    Card,
    CardActions,
    CardContent, Collapse,
    List, ListItem,
    ListItemButton,
    ListItemText,
    Typography
} from "@mui/material";
import {Link, useLocation} from "react-router-dom";
import IHashResults from "../common/IHashResults";
import {ExpandLess, ExpandMore} from "@mui/icons-material";
import {useState} from "react";

const open = [false, false, false];

export default function HashDetails() {
    const location = useLocation();
    const {hashResult} = location.state;
    const data = hashResult as IHashResults

    const [dummy, setDummy] = useState({});

    const handleClick = (num: number) => {
        open[num] = !open[num];
        setDummy({});
    };

    const hashes = Object.entries(data.results.hashes!!);

    return <>
        <Box
            component={"div"}
            display={"grid"}
            justifyContent={"center"}
        >
            <Card sx={{minWidth: 1200}}>
                <CardContent>
                    <Typography sx={{fontSize: 14, my: 0}} color="text.secondary">
                        Result ID
                    </Typography>
                    <Typography variant="h6" component="div">
                        {data.resId}
                    </Typography>

                    <Typography sx={{fontSize: 14, my: 0}} color="text.secondary">
                        Error
                    </Typography>
                    <Typography variant="h6" component="div">
                        {data.hasError ? "Has occurred" : "Has not occurred"}
                    </Typography>

                    <div style={{display: data.hasError ? "block" : "none"}}>
                        <Typography sx={{fontSize: 14, my: 0}} color="text.secondary">
                            Description
                        </Typography>
                        <Typography variant="h6" component="div">
                            {data.hasError ? data.results.error : null}
                        </Typography>
                    </div>

                    <Typography sx={{fontSize: 14, my: 0}} color="text.secondary">
                        Content
                    </Typography>
                    <Typography variant="h6" component="div">
                        {data.results.pathToContent}
                    </Typography>

                    <List style={{display: hashes.length ? "block" : "none"}}>
                        <ListItem sx={{px: 0}} key={"title"}>
                            <Typography sx={{fontSize: 14, my: 0}} key={"title-typography"} color="text.secondary">
                                Hash results
                            </Typography>
                        </ListItem>
                        {hashes.map((entry, index) =>
                            <div key={"div-" + entry[0]}>
                                <ListItemButton onClick={e => handleClick(index)} key={"button-" + entry[0]}>
                                    <ListItemText primary={entry[0]}/>
                                    {open[index] ? <ExpandLess/> : <ExpandMore/>}
                                </ListItemButton>
                                <Collapse in={open[index]} timeout="auto" unmountOnExit key={"collapse-" + entry[0]}>
                                    <List component="div" disablePadding key={"sublist-" + entry[0]}>
                                        {Object.entries(entry[1]).map(value =>
                                            <Typography variant="h6" component="div" key={value[0]}>
                                                {(value[0].length > 25 ? (value[0].slice(0, 15) + "..." + value[0].slice(-9)) : value[0]) + " - " + value[1]}
                                            </Typography>
                                        )}
                                    </List>
                                </Collapse>
                            </div>
                        )}
                    </List>

                    <Typography sx={{fontSize: 14, my: 0}} color="text.secondary">
                        Size in MB
                    </Typography>
                    <Typography variant="h6" component="div">
                        {data.size}
                    </Typography>

                </CardContent>
                <CardActions>
                    <Link to={"/hashing"}>Go Back</Link>
                </CardActions>
            </Card>
        </Box>
    </>
}