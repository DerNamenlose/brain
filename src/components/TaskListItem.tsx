import { Task } from '../model/Task';
import React, { Fragment } from 'react';
import {
    ListItem,
    ListItemText,
    makeStyles,
    createStyles
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import LandscapeIcon from '@material-ui/icons/Landscape';
import TableChartIcon from '@material-ui/icons/TableChart';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import EventIcon from '@material-ui/icons/Event';

const useStyles = makeStyles(theme =>
    createStyles({
        done: {
            textDecoration: 'line-through',
            color: theme.palette.grey[500]
        },
        metaEntry: {
            marginLeft: '0.5em',
            whiteSpace: 'nowrap'
        },
        metaText: {
            whiteSpace: 'normal'
        },
        dueToday: {
            color: theme.palette.primary.main
        },
        overdue: {
            color: theme.palette.error.main
        }
    })
);

/**
 * Properties accepted by the TaskListItem component
 */
export interface TaskListItemProps {
    task: Task;
}

function DueClass(task: Task): string {
    const classes = useStyles();
    const today = new Date(Date.now()).toISOString().slice(0, 10);
    const due = task.due && task.due.toISOString().slice(0, 10);
    if (!due || due > today) {
        return '';
    }
    if (due === today) {
        return classes.dueToday;
    }
    return classes.overdue;
}

function MetaDisplay(props: { task: Task }) {
    const classes = useStyles();
    return (
        <Fragment>
            {props.task.contexts && props.task.contexts.length !== 0 && (
                <span className={classes.metaEntry}>
                    <LandscapeIcon fontSize='inherit' />
                    <span className={classes.metaText}>
                        {props.task.contexts.join(', ')}
                    </span>
                </span>
            )}{' '}
            {props.task.projects && props.task.projects.length !== 0 && (
                <span className={classes.metaEntry}>
                    <TableChartIcon fontSize='inherit' />
                    {props.task.projects.join(', ')}
                </span>
            )}{' '}
            {props.task.tags && props.task.tags.length !== 0 && (
                <span className={classes.metaEntry}>
                    <LocalOfferIcon fontSize='inherit' />
                    <span className={classes.metaText}>
                        {props.task.tags.join(', ')}
                    </span>
                </span>
            )}{' '}
            {props.task.due && (
                <span
                    className={`${classes.metaEntry} ${DueClass(props.task)}`}>
                    <EventIcon fontSize='inherit' />
                    <span className={classes.metaText}>
                        {props.task.due.toLocaleDateString()}
                    </span>
                </span>
            )}
        </Fragment>
    );
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
                // secondary={
                //     props.task.due &&
                //     `Due: ${props.task.due.toLocaleDateString()}`
                // }
                secondary={<MetaDisplay task={props.task} />}
                className={(props.task.done && classes.done) || undefined}
            />
        </ListItem>
    );
}
