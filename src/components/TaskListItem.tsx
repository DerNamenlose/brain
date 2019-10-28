import { Task } from '../model/Task';
import React from 'react';
import {
    ListItem,
    ListItemText,
    makeStyles,
    createStyles
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles(theme =>
    createStyles({
        done: {
            textDecoration: 'line-through',
            color: theme.palette.grey[500]
        }
    })
);

/**
 * Properties accepted by the TaskListItem component
 */
export interface TaskListItemProps {
    task: Task;
}

/**
 * An item in the task list representing a single item
 *
 * @param props The properties of this component
 */
export function TaskListItem(props: TaskListItemProps) {
    const classes = useStyles();
    const history = useHistory();
    return (
        <ListItem button onClick={() => history.push(`/task/${props.task.id}`)}>
            <ListItemText
                primary={props.task.title}
                secondary={
                    props.task.due &&
                    `Due: ${props.task.due.toLocaleDateString()}`
                }
                className={(props.task.done && classes.done) || undefined}
            />
        </ListItem>
    );
}
