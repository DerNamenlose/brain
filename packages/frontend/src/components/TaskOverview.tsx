import { Fragment } from 'react';
import React from 'react';
import {
    AppBar,
    Toolbar,
    makeStyles,
    createStyles,
    Theme
} from '@material-ui/core';
import { ContextsButton } from './ContextsButton';
import { ProjectsButton } from './ProjectsButton';
import { TagsButton } from './TagsButton';
import { fade } from '@material-ui/core/styles';
import { IDispatchReceiver } from '../util/dispatcher';
import { overviewFilter } from '../util/Filter';
import { GlobalState } from '../model/GlobalState';
import { TaskList } from './TaskList';

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
        task: {
            margin: 2
        }
    })
);

export function TaskOverview(props: IDispatchReceiver) {
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
                        </Toolbar>
                    </AppBar>
                    <TaskList
                        tasks={overviewFilter(
                            state.tasks,
                            state.selectedContexts,
                            state.selectedProjects,
                            state.selectedTags
                        )}
                    />
                </Fragment>
            )}
        </GlobalState.Consumer>
    );
}
