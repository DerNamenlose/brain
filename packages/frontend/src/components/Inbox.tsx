import { Fragment } from 'react';
import React from 'react';
import { GlobalState } from '../model/GlobalState';
import { TaskList } from './TaskList';
import { inboxFilter } from '../util/Filter';
import {
    AppBar,
    Toolbar,
    makeStyles,
    createStyles,
    Button
} from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import { useHistory } from 'react-router';

const useStyles = makeStyles(() =>
    createStyles({
        appBar: {
            top: 'auto',
            bottom: 0
        },
        settings: {
            marginLeft: 'auto',
            marginRight: 0
        }
    })
);

export function Inbox() {
    const classes = useStyles();
    const history = useHistory();
    return (
        <GlobalState.Consumer>
            {state => (
                <Fragment>
                    <TaskList tasks={inboxFilter(state.config, state.tasks)} />
                    <AppBar className={classes.appBar}>
                        <Toolbar>
                            <Button
                                className={classes.settings}
                                onClick={() => history.push('/config')}>
                                <SettingsIcon className={classes.settings} />
                            </Button>
                        </Toolbar>
                    </AppBar>
                </Fragment>
            )}
        </GlobalState.Consumer>
    );
}
