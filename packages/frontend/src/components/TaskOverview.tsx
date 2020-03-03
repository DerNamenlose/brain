import { Fragment } from 'react';
import React from 'react';
import {
    AppBar,
    Toolbar,
    makeStyles,
    createStyles,
    Theme,
    Button
} from '@material-ui/core';
import { ContextsButton } from './ContextsButton';
import { ProjectsButton } from './ProjectsButton';
import { TagsButton } from './TagsButton';
import { fade } from '@material-ui/core/styles';
import { overviewFilter } from '../util/Filter';
import { GlobalState } from '../model/GlobalState';
import { TaskList } from './TaskList';
import { DueFilters } from './DueFilters';
import SettingsIcon from '@material-ui/icons/Settings';
import { useHistory } from 'react-router';
import { DelegateButton } from './DelegateButton';

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
        },
        settings: {
            marginLeft: 'auto',
            marginRight: 0
        }
    })
);

export function TaskOverview() {
    const classes = useStyles();
    const history = useHistory();
    return (
        <GlobalState.Consumer>
            {state => (
                <Fragment>
                    <AppBar className={classes.appBar}>
                        <Toolbar>
                            <ContextsButton />
                            <ProjectsButton />
                            <TagsButton />
                            <DueFilters />
                            <DelegateButton />
                            <Button
                                className={classes.settings}
                                onClick={() => history.push('/config')}>
                                <SettingsIcon className={classes.settings} />
                            </Button>
                        </Toolbar>
                    </AppBar>
                    <TaskList
                        tasks={overviewFilter(state.config, state.tasks)}
                    />
                </Fragment>
            )}
        </GlobalState.Consumer>
    );
}
