import { Fragment } from 'react';
import React from 'react';
import { GlobalState } from '../model/GlobalState';
import { TaskList } from './TaskList';
import { inboxFilter } from '../util/Filter';
import { AppBar, Toolbar, makeStyles, createStyles } from '@material-ui/core';

const useStyles = makeStyles(() =>
    createStyles({
        appBar: {
            top: 'auto',
            bottom: 0
        }
    })
);

export function Inbox() {
    const classes = useStyles();
    return (
        <GlobalState.Consumer>
            {state => (
                <Fragment>
                    <TaskList tasks={inboxFilter(state.config, state.tasks)} />
                    <AppBar className={classes.appBar}>
                        <Toolbar></Toolbar>
                    </AppBar>
                </Fragment>
            )}
        </GlobalState.Consumer>
    );
}
