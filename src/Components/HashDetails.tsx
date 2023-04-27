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
import IHashResult from "../common/IHashResult";
import {ExpandLess, ExpandMore} from "@mui/icons-material";
import {useState} from "react";
import TableOfHashes, {HashData} from "./TableOfHashes";

const openTable = [false, false, false];

interface ResultProps {
    id: number,
}

function ResultIdBlock(props: ResultProps) {
    return <>
        <Typography sx={{fontSize: 14, my: 0}} color="text.secondary">
            Result ID
        </Typography>
        <Typography variant="h6" component="div">
            {props.id}
        </Typography>
    </>
}

interface ErrorProps {
    errorMessage: string,
}

function ErrorBlock(props: ErrorProps) {
    return <>
        <Typography sx={{fontSize: 14, my: 0}} color="text.secondary">
            Error
        </Typography>
        <Typography variant="h6" component="div">
            Has occurred
        </Typography>

        <Typography sx={{fontSize: 14, my: 0}} color="text.secondary">
            Description
        </Typography>
        <Typography variant="h6" component="div">
            {props.errorMessage}
        </Typography>
    </>
}

interface HashResultsProps {
    hashes: [string, any][],
    handleClick: (index: number) => void,
}

function HashResultsBlock(props: HashResultsProps) {
    return <>
        <List>
            <ListItem sx={{px: 0}} key={"title"}>
                <Typography sx={{fontSize: 14, my: 0}} key={"title-typography"} color="text.secondary">
                    Hash results
                </Typography>
            </ListItem>

            {props.hashes.sort().map((entry, index) => {
                return <div key={"div-" + entry[0]}>
                    <ListItemButton onClick={() => props.handleClick(index)} key={"button-" + entry[0]}>
                        <ListItemText primary={entry[0]}/>
                        {openTable[index] ? <ExpandLess/> : <ExpandMore/>}
                    </ListItemButton>
                    <Collapse in={openTable[index]} timeout="auto" unmountOnExit key={"collapse-" + entry[0]}>
                        <TableOfHashes dataToDisplay={parseHashesToRenderHashData(entry[1])}/>
                    </Collapse>
                </div>
            })}
        </List>
    </>
}

interface ContentLocationProps {
    contentLocation: string,
}

function ContentLocationBlock(props: ContentLocationProps) {
    return <>
        <Typography sx={{fontSize: 14, my: 0}} color="text.secondary">
            Content Location
        </Typography>
        <Typography variant="h6" component="div">
            {props.contentLocation}
        </Typography>
    </>
}

interface SizeProps {
    sizeInMB: number,
}

function SizeBlock(props: SizeProps) {
    return <>
        <Typography sx={{fontSize: 14, my: 0}} color="text.secondary">
            Size in MB
        </Typography>
        <Typography variant="h6" component="div">
            {props.sizeInMB}
        </Typography>
    </>
}

export default function HashDetails() {
    const location = useLocation();
    const {hashResult} = location.state;
    const data = hashResult as IHashResult

    const [dummy, setDummy] = useState({});

    const handleExpandButtonClick = (num: number) => {
        openTable[num] = !openTable[num];
        setDummy({...dummy});
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
                    <ResultIdBlock id={data.resId}/>
                    {data.hasError ? <ErrorBlock errorMessage={data.results.error!!}/> : null}
                    <ContentLocationBlock contentLocation={data.results.pathToContent}/>
                    {hashes.length ? <HashResultsBlock hashes={hashes} handleClick={handleExpandButtonClick}/> : null}
                    {!data.hasError ? <SizeBlock sizeInMB={data.size}/> : null}
                </CardContent>
                <CardActions>
                    <Link to={"/hashing"}>Go Back</Link>
                </CardActions>
            </Card>
        </Box>
    </>
}

function parseHashesToRenderHashData(hashes: Map<string, string>): Array<HashData> {
    return Object.entries(hashes).map(entry => {
        return {content: entry[0], hash: entry[1]} as HashData
    })
}