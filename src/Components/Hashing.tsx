import {FormEvent, MouseEvent, useEffect, useRef, useState} from "react";
import {
    Box,
    Button, Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup, FormHelperText,
    FormLabel,
    TextField
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import IHashResults from "../common/IHashResults";
import TableOfHashes from "./TableOfHashes";
import TasksInProgress from "./TasksInProgress";
import generateRandomNumber from "../common/generateRandomNumber";

const HASH_REQUEST_URL: string = "http://localhost:8888/hashing";
const PROGRESS_REQUEST_URL: string = "http://localhost:8888/hashing/progress";
const STOP_REQUEST_URL: string = "http://localhost:8888/hashing/stop";

export interface IHashRequest {
    taskId: number,
    fullPath: string,
    hashTypes: Object
}

export interface ITaskInProgress {
    taskId: number;
    path: string;
    hashTypes: string;
    progress: number;
}

function usePolling<T>(fetch: () => Promise<T>, intervalMs: number): T | undefined {
    const [state, setState] = useState<T>();

    const fetchRef = useRef(fetch)
    fetchRef.current = fetch

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchRef.current().then(res => setState(res));
        }, intervalMs);

        return () => clearInterval(intervalId);
    }, [intervalMs]);

    return state;
}

async function getTasksInProgress(): Promise<ITaskInProgress[]> {
    let result: ITaskInProgress[] = [];

    try {
        result = await axios.get(
            PROGRESS_REQUEST_URL,
        ).then(response => response.data)
    } catch (e) {
        console.log(e);
    }
    return result;
}

function Hashing() {
    const progresses = usePolling(getTasksInProgress, 500);

    const responsesRef = useRef<IHashResults[]>([])

    const [md5, setMd5] = useState<boolean>(true);
    const [sha1, setSha1] = useState<boolean>(false);
    const [sha256, setSha256] = useState<boolean>(false);

    const [fullPath, setFullPath] = useState<string>("/home/atola/test-samples");

    const error = !md5 && !sha1 && !sha256

    useEffect(() => {
        document.title = "Multi-Hasher 3000";
    }, []);

    useEffect(() => {
        const data = localStorage.getItem("data");
        if (data !== null)
            responsesRef.current = JSON.parse(data);

        window.onbeforeunload = () => localStorage.setItem("data", JSON.stringify(responsesRef.current));
        return () => localStorage.setItem("data", JSON.stringify(responsesRef.current));
    }, []);

    const handleRequestSending = (event: MouseEvent<HTMLButtonElement> | FormEvent) => {
        event.preventDefault();

        if (error) return;

        const taskId = generateRandomNumber(1, 1_000_000);
        const request: IHashRequest = {taskId, fullPath, hashTypes: {md5, sha1, sha256}};

        try {
            axios.post(
                HASH_REQUEST_URL,
                JSON.stringify(request),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                },
            ).then(response => {
                return response.data as IHashResults;
            })
                .then(data => {
                    if (isStopped(data)) return
                    responsesRef.current.push({...data});
                });
        } catch (e) {
            console.log(e);
        }
    }

    const handleStopRequest = async (id: number, event: MouseEvent<HTMLButtonElement> | FormEvent) => {
        event.preventDefault();

        try {
            await axios.post(
                STOP_REQUEST_URL + `/${id}`,
                {
                    withCredentials: true,
                },
            ).then(response => response.data)
                .then(data => responsesRef.current.push({...data}));
        } catch (e) {
            console.log(e);
        }
    }

    const handleClearHistory = () => {
        responsesRef.current = [];
    }

    return <>
        <Box
            component="form"
            sx={{
                '& .MuiTextField-root': {mt: 5, width: '80vw'},
            }}
            display={"grid"}
            justifyContent={"center"}
            onSubmit={(e) => handleRequestSending(e)}
        >
            <TextField
                label="Full path to content"
                value={fullPath}
                variant="outlined"
                onChange={(e) => setFullPath(e.target.value)}
                sx={{marginBottom: '1.5rem'}}
            />
            <FormControl required error={error} sx={{my: 2}} component="fieldset" variant="standard">
                <FormLabel component="legend">Hash types</FormLabel>
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Checkbox checked={md5} onChange={(e) => setMd5(e.target.checked)} name="MD5"/>
                        }
                        label="MD-5"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox checked={sha1} onChange={(e) => setSha1(e.target.checked)} name="SHA1"/>
                        }
                        label="SHA-1"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox checked={sha256} onChange={(e) => setSha256(e.target.checked)} name="SHA256"/>
                        }
                        label="SHA-256"
                    />
                </FormGroup>
                <FormHelperText>Check at least one</FormHelperText>
            </FormControl>
            <Button variant="contained" onClick={handleRequestSending}
                    sx={{
                        width: '100%',
                        my: '0.5rem'
                    }}
                    endIcon={<SendIcon/>}
            >Hash data</Button>
            <TasksInProgress tasksInProgress={progresses ? progresses : []} stopHandler={handleStopRequest}/>
            <TableOfHashes finishedTasks={responsesRef.current} clearHistoryHandler={handleClearHistory}/>
        </Box>
    </>
}

const isStopped = (data: IHashResults): boolean => {
    return data.hasError && data.results.error === ""
}

export default Hashing;