import { Fragment } from 'react';
import React from 'react';
import {
    AppBar,
    Toolbar,
    InputBase,
    Fab,
    List,
    makeStyles,
    createStyles,
    Theme
} from '@material-ui/core';
import { ContextsButton } from './ContextsButton';
import { ProjectsButton } from './ProjectsButton';
import { TagsButton } from './TagsButton';
import { TaskListItem } from './TaskListItem';
import AddIcon from '@material-ui/icons/Add';
import Search from '@material-ui/icons/Search';
import { fade } from '@material-ui/core/styles';
import { useHistory } from 'react-router';
import { orderByDone } from '../util/order';
import { IDispatchReceiver } from '../util/dispatcher';
import { Task } from '../model/Task';
import { applyFilter } from '../util/Filter';
import { GlobalState } from '../model/GlobalState';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        appBar: {
            top: 'auto',
            bottom: 0
        },
        search: {
            position: 'relative',
            borderRadius: theme.shape.borderRadius,
            backgroundColor: fade(theme.palette.common.white, 0.15),
            '&:hover': {
                backgroundColor: fade(theme.palette.common.white, 0.25)
            },
            marginLeft: 0,
            width: '100%',
            [theme.breakpoints.up('sm')]: {
                marginLeft: theme.spacing(1),
                width: 'auto'
            }
        },
        searchIcon: {
            width: theme.spacing(7),
            height: '100%',
            position: 'absolute',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        inputRoot: {
            color: 'inherit'
        },
        inputInput: {
            padding: theme.spacing(1, 1, 1, 7),
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.up('sm')]: {
                width: 120,
                '&:focus': {
                    width: 200
                }
            }
        },
        addButton: {
            position: 'absolute',
            zIndex: 1,
            top: -70,
            left: 0,
            right: 0,
            marginLeft: 'auto',
            marginRight: 10
        },
        task: {
            margin: 2
        }
    })
);

export function TaskOverview(props: IDispatchReceiver) {
    const history = useHistory();
    const classes = useStyles();
    return (
        <GlobalState.Consumer>
            {state => (
                <Fragment>
                    <AppBar className={classes.appBar}>
                        <Toolbar>
                            <ContextsButton dispatch={props.dispatch} />
                            <ProjectsButton dispatch={props.dispatch} />
                            <TagsButton dispatch={props.dispatch} />
                            <div className={classes.search}>
                                <div className={classes.searchIcon}>
                                    <Search />
                                </div>
                                <InputBase
                                    classes={{
                                        root: classes.inputRoot,
                                        input: classes.inputInput
                                    }}
                                    inputProps={{ 'aria-label': 'search' }}
                                />
                            </div>
                        </Toolbar>
                        <Fab
                            color='secondary'
                            aria-label='add'
                            className={classes.addButton}
                            onClick={() => history.push('/newTask')}>
                            <AddIcon />
                        </Fab>
                    </AppBar>
                    <List>
                        {applyFilter(
                            state.tasks,
                            state.selectedContexts,
                            state.selectedProjects,
                            state.selectedTags
                        )
                            .sort(orderByDone)
                            .map(task => (
                                <TaskListItem
                                    key={task.id.toString()}
                                    task={task}
                                />
                            ))}
                    </List>
                </Fragment>
            )}
        </GlobalState.Consumer>
    );
}
