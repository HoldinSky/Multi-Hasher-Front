import {ChangeEvent, Dispatch, FormEvent, MouseEvent, SetStateAction, useEffect, useRef, useState} from "react";
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

interface InputForHashingProps {
    fullPath: string,
    setFullPath: Dispatch<SetStateAction<string>>
    error: boolean,
    hashTypes: HashType[],
    handleCheckBox: (event: ChangeEvent<HTMLInputElement>, value: HashType) => void,
    handleRequest: (event: MouseEvent<HTMLButtonElement> | FormEvent) => void,
}

function InputForHashing(props: InputForHashingProps) {
    return <>
        <TextField
            label="Full path to content"
            value={props.fullPath}
            variant="outlined"
            onChange={(e) => props.setFullPath(e.target.value)}
            sx={{marginBottom: '1.5rem'}}
        />
        <FormControl required error={props.error} sx={{mb: 1}} component="fieldset" variant="standard">
            <FormLabel component="legend">Hash types</FormLabel>
            <FormGroup>
                {Object.entries(HashType).map((value) =>
                    <FormControlLabel
                        key={value[0]}
                        control={
                            <Checkbox checked={props.hashTypes.includes(value[1])}
                                      onChange={e => props.handleCheckBox(e, value[1])}
                                      name="MD5"/>
                        }
                        label={value[1]}
                    />)}
            </FormGroup>
            <FormHelperText>Check at least one</FormHelperText>
        </FormControl>
        <Button variant="contained" onClick={props.handleRequest}
                sx={{
                    width: '100%',
                    my: '0.5rem'
                }}
                endIcon={<SendIcon color="secondary"/>}
        ><p style={{fontWeight: "bolder", margin: 0, color: "#3272ff"}}>Hash data</p></Button>
    </>
}

function Hashing() {
    const progresses = usePolling(getTasksInProgress, 500);
    useEffect(() => {
        progresses?.forEach((entry) => {
            if (entry.status === "FINISHED")
                getFinishedTask(entry.taskId).then(data => responsesRef.current.push(data))
        });
    }, [progresses]);

    useEffect(() => {
        const data = localStorage.getItem("data");
        if (data !== null)
            responsesRef.current = JSON.parse(data);

        window.onbeforeunload = () => localStorage.setItem("data", JSON.stringify(responsesRef.current));
        return () => localStorage.setItem("data", JSON.stringify(responsesRef.current));
    }, []);

    const [hashTypes, setHashTypes] = useState<HashType[]>([HashType.MD5, HashType.SHA1, HashType.SHA256])
    const [fullPath, setFullPath] = useState<string>("/home/atola/test-samples/Kingston DataTraveler 2.0 001372708ADBF9A196310CC5.E01");
    const error = hashTypes.length === 0;

    const responsesRef = useRef<IHashResult[]>([])

    function handleCheckBoxChange(e: ChangeEvent<HTMLInputElement>, hashType: HashType): void {
        setHashTypes(prev => !e.target.checked ? prev.filter(it => it !== hashType).sort() : [...prev, hashType].sort());
    }

    function handleRequestSending(event: MouseEvent<HTMLButtonElement> | FormEvent) {
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

    async function handleStopRequest(id: number, event: MouseEvent<HTMLButtonElement> | FormEvent) {
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
            <InputForHashing fullPath={fullPath} setFullPath={setFullPath}
                             error={error} hashTypes={hashTypes}
                             handleCheckBox={handleCheckBoxChange} handleRequest={handleRequestSending}/>
            <TasksInProgress tasksInProgress={progresses ? progresses : []} stopHandler={handleStopRequest}/>
            <TableOfResults finishedTasks={responsesRef.current} clearHistoryHandler={handleClearHistory}/>
        </Box>
    </>
}

export default Hashing;