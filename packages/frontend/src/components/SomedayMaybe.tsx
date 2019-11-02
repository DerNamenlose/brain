import { IDispatchReceiver } from '../util/dispatcher';
import { Fragment } from 'react';
import React from 'react';
import { GlobalState } from '../model/GlobalState';
import { TaskList } from './TaskList';
import { somedayMaybeFilter } from '../util/Filter';
import AppBar from '@material-ui/core/AppBar';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Toolbar } from '@material-ui/core';

const useStyles = makeStyles(() =>
    createStyles({
        appBar: {
            top: 'auto',
            bottom: 0
        }
    })
);

export function SomedayMaybe(props: IDispatchReceiver) {
    const classes = useStyles();
    return (
        <GlobalState.Consumer>
            {state => (
                <Fragment>
                    <TaskList tasks={somedayMaybeFilter(state.tasks)} />
                    <AppBar className={classes.appBar}>
                        <Toolbar></Toolbar>
                    </AppBar>
                </Fragment>
            )}
        </GlobalState.Consumer>
    );
}
