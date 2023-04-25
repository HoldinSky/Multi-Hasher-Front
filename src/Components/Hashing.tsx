import {ChangeEvent, FormEvent, MouseEvent, useEffect, useRef, useState} from "react";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    FormLabel,
    TextField
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import IHashResult, {EMPTY_RESULT} from "../common/IHashResult";
import TableOfResults from "./TableOfResults";
import TasksInProgress from "./TasksInProgress";
import generateRandomNumber from "../common/generateRandomNumber";

const HASH_REQUEST_URL: string = "http://localhost:8888/hashing";
const STOP_REQUEST_URL: string = "http://localhost:8888/hashing/stop";
const PROGRESS_REQUEST_URL: string = "http://localhost:8888/hashing/progress";
const GET_TASK_REQUEST_URL: string = "http://localhost:8888/hashing/task";

export interface IHashRequest {
    taskId: number,
    fullPath: string,
    hashTypes: string
}

export interface ITaskInProgress {
    taskId: number;
    path: string;
    hashTypes: string;
    progress: number;
    speed: number;
    currentHash: string;
    status: string;
}

enum HashType {
    MD5 = "MD5",
    SHA1 = "SHA-1",
    SHA256 = "SHA-256",
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

async function getFinishedTask(taskId: number): Promise<IHashResult> {
    try {
        return await axios.get(
            GET_TASK_REQUEST_URL + `/${taskId}`,
        ).then(response => response.data as IHashResult)
            .then(data => data);
    } catch (e) {
        console.log(e);
    }

    return EMPTY_RESULT;
}

function Hashing() {
    const progresses = usePolling(getTasksInProgress, 500);

    useEffect(() => {
        progresses?.forEach((entry) => {
            if (entry.status === "FINISHED")
                getFinishedTask(entry.taskId).then(data => responsesRef.current.push(data))
        });
    }, [progresses]);

    const responsesRef = useRef<IHashResult[]>([])

    const [hashTypes, setHashTypes] = useState<HashType[]>([HashType.MD5, HashType.SHA1, HashType.SHA256])
    const [fullPath, setFullPath] = useState<string>("/home/atola/test-samples");

    const error = hashTypes.length === 0;

    useEffect(() => {
        const data = localStorage.getItem("data");
        if (data !== null)
            responsesRef.current = JSON.parse(data);

        window.onbeforeunload = () => localStorage.setItem("data", JSON.stringify(responsesRef.current));
        return () => localStorage.setItem("data", JSON.stringify(responsesRef.current));
    }, []);

    function handleCheckBoxChange(e: ChangeEvent<HTMLInputElement>, hashType: HashType): void {
        setHashTypes(prev => !e.target.checked ? prev.filter(it => it !== hashType).sort() : [...prev, hashType].sort());
    }

    const handleRequestSending = (event: MouseEvent<HTMLButtonElement> | FormEvent) => {
        event.preventDefault();

        if (error) return;

        const taskId = generateRandomNumber(1, 1_000_000);
        const request: IHashRequest = {
            taskId,
            fullPath,
            hashTypes: hashTypes.map(hashType => hashType.replace("-", "")).join(",")
        };

        try {
            axios.post(
                HASH_REQUEST_URL,
                request,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                },
            ).then(r => r);
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
                    {Object.entries(HashType).map((value) =>
                        <FormControlLabel
                            key={value[0]}
                            control={
                                <Checkbox checked={hashTypes.includes(value[1])}
                                          onChange={e => handleCheckBoxChange(e, value[1])}
                                          name="MD5"/>
                            }
                            label={value[1]}
                        />)}
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
            <TableOfResults finishedTasks={responsesRef.current} clearHistoryHandler={handleClearHistory}/>
        </Box>
    </>
}

export default Hashing;