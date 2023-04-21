import {MouseEvent} from "react";
import {IconButton, List, ListItem, ListItemText, Typography} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import {ITaskInProgress} from "./Hashing";

interface TaskInProgressProps {
    tasksInProgress: Array<ITaskInProgress>,
    stopHandler: (id: number, event: MouseEvent<HTMLButtonElement>) => void
}

function TasksInProgress(props: TaskInProgressProps) {
    const inProgress = props.tasksInProgress;
    const stopHandler = props.stopHandler;

    return <>
        <Typography sx={{my: '0.5rem', justifyContent: 'center'}} variant="h6" component="div">
            Tasks In Progress
        </Typography>
        <List dense={true}>
            {inProgress.length
                ? inProgress.map(entry => {
                    return (
                    <ListItem
                        secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={(event) => stopHandler(entry.taskId, event)}>
                                <DeleteIcon/>
                            </IconButton>
                        }
                        key={entry.taskId}
                    >
                        <ListItemText
                            primary={"Task ID: " + entry.taskId + ", Hash types: " + entry.hashTypes + ", Content: " + entry.path + ", Progress: " + entry.progress + "%"}
                        />
                    </ListItem>
                    );
                })
                :
                <ListItem>
                    <ListItemText primary={"There are no tasks in progress"}/>
                </ListItem>
            }
        </List>
    </>
}

export default TasksInProgress;