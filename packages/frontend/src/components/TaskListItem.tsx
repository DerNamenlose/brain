import { Task, TaskPrio } from 'brain-common';
import React, { Fragment } from 'react';
import {
    ListItem,
    ListItemText,
    makeStyles,
    createStyles,
    Typography
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import LandscapeIcon from '@material-ui/icons/Landscape';
import TableChartIcon from '@material-ui/icons/TableChart';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import AlarmOnIcon from '@material-ui/icons/AlarmOn';
import {
    red,
    orange,
    yellow,
    green,
    lightBlue,
    grey
} from '@material-ui/core/colors';
import { formatDistance } from 'date-fns';
import { toDateDisplay } from '../util/displayHelper';
import { TaskStartIcon, DelegateTaskIcon } from './Icons';

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
        },
        priority: {
            borderRadius: '50%',
            width: '1em',
            height: '1em',
            display: 'inline-block',
            textAlign: 'center',
            paddingBottom: theme.spacing(0.5),
            paddingLeft: theme.spacing(0.25),
            paddingRight: theme.spacing(0.25)
        },
        prioA: {
            backgroundColor: red[500],
            color: theme.palette.getContrastText(red[500])
        },
        prioB: {
            backgroundColor: orange[500],
            color: theme.palette.getContrastText(orange[500])
        },
        prioC: {
            backgroundColor: yellow[500],
            color: theme.palette.getContrastText(yellow[500])
        },
        prioD: {
            backgroundColor: green[500],
            color: theme.palette.getContrastText(green[500])
        },
        prioE: {
            backgroundColor: lightBlue[200],
            color: theme.palette.getContrastText(lightBlue[200])
        },
        prioF: {
            backgroundColor: grey[500],
            color: theme.palette.getContrastText(grey[500])
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
    const due = task.due && toDateDisplay(task.due);
    if (!due || due > today) {
        return '';
    }
    if (due === today) {
        return classes.dueToday;
    }
    return classes.overdue;
}

function PrioDisplay(props: { prio: TaskPrio }) {
    const classes = useStyles();
    let prioClass = undefined;
    switch (props.prio) {
        case 'A':
            prioClass = classes.prioA;
            break;
        case 'B':
            prioClass = classes.prioB;
            break;
        case 'C':
            prioClass = classes.prioC;
            break;
        case 'D':
            prioClass = classes.prioD;
            break;
        case 'E':
            prioClass = classes.prioE;
            break;
        case 'F':
            prioClass = classes.prioF;
            break;
    }
    return (
        <span className={`${classes.priority} ${prioClass}`}>{props.prio}</span>
    );
}

function AgeDisplay(props: { created: Date; task: Task }) {
    const classes = useStyles();
    const age = formatDistance(props.created, new Date());
    return (
        props.created && (
            <span className={classes.metaEntry}>
                <SaveAltIcon fontSize='inherit' />
                <Typography variant='srOnly'>Age</Typography>
                <span className={classes.metaText}>{age} ago</span>
            </span>
        )
    );
}

function MetaDisplay(props: { task: Task }) {
    const classes = useStyles();
    return (
        <Fragment>
            {props.task.priority && <PrioDisplay prio={props.task.priority} />}
            {props.task.contexts && props.task.contexts.length !== 0 && (
                <span className={classes.metaEntry}>
                    <LandscapeIcon fontSize='inherit' />
                    <Typography variant='srOnly'>Contexts</Typography>
                    <span className={classes.metaText}>
                        {props.task.contexts.join(', ')}
                    </span>
                </span>
            )}{' '}
            {props.task.projects && props.task.projects.length !== 0 && (
                <span className={classes.metaEntry}>
                    <TableChartIcon fontSize='inherit' />
                    <Typography variant='srOnly'>Projects</Typography>
                    {props.task.projects.join(', ')}
                </span>
            )}{' '}
            {props.task.tags && props.task.tags.length !== 0 && (
                <span className={classes.metaEntry}>
                    <LocalOfferIcon fontSize='inherit' />
                    <Typography variant='srOnly'>Tags</Typography>
                    <span className={classes.metaText}>
                        {props.task.tags.join(', ')}
                    </span>
                </span>
            )}{' '}
            {props.task.start && (
                <span className={classes.metaEntry}>
                    <TaskStartIcon fontSize='inherit' />
                    <Typography variant='srOnly'>Start date</Typography>
                    <span className={classes.metaText}>
                        {new Date(props.task.start).toLocaleDateString()}
                    </span>
                </span>
            )}{' '}
            {props.task.due && (
                <span
                    className={`${classes.metaEntry} ${DueClass(props.task)}`}>
                    <AlarmOnIcon fontSize='inherit' />
                    <Typography variant='srOnly'>Due date</Typography>
                    <span className={classes.metaText}>
                        {new Date(props.task.due).toLocaleDateString()}
                    </span>
                </span>
            )}{' '}
            {props.task.created && (
                <AgeDisplay
                    created={new Date(props.task.created)}
                    task={props.task}
                />
            )}{' '}
            {props.task.delegatedTo && (
                <span className={classes.metaText}>
                    <DelegateTaskIcon fontSize='inherit' />
                    <span className={classes.metaText}>
                        {props.task.delegatedTo}
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
                secondary={<MetaDisplay task={props.task} />}
                className={(props.task.done && classes.done) || undefined}
            />
        </ListItem>
    );
}
