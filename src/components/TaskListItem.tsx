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

const useStyles = makeStyles(theme =>
    createStyles({
        done: {
            textDecoration: 'line-through',
            color: theme.palette.grey[500]
        },
        metaEntry: {
            marginLeft: '1em'
        }
    })
);

/**
 * Properties accepted by the TaskListItem component
 */
export interface TaskListItemProps {
    task: Task;
}

function MetaDisplay(props: { task: Task }) {
    const classes = useStyles();
    return (
        <Fragment>
            {props.task.contexts && (
                <span className={classes.metaEntry}>
                    <LandscapeIcon fontSize='inherit' />{' '}
                    {props.task.contexts.join(', ')}
                </span>
            )}
            {props.task.projects && (
                <span className={classes.metaEntry}>
                    <TableChartIcon fontSize='inherit' />{' '}
                    {props.task.projects.join(', ')}
                </span>
            )}
            {props.task.tags && (
                <span className={classes.metaEntry}>
                    <LocalOfferIcon fontSize='inherit' />{' '}
                    {props.task.tags.join(', ')}
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
