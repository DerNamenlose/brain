import React, { Fragment, useContext } from 'react';
import {
    FormControl,
    Checkbox,
    FormControlLabel,
    Button
} from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Dispatcher } from '../util/dispatcher';
import { useHistory } from 'react-router';
import { GlobalState } from '../model/GlobalState';

const useStyles = makeStyles(theme =>
    createStyles({
        backButton: {
            marginLeft: 0,
            marginRight: 'auto'
        },
        backButtonRoot: {
            display: 'flex'
        }
    })
);

export function ConfigEditor() {
    const classes = useStyles();
    const dispatch = useContext(Dispatcher);
    const history = useHistory();
    return (
        <GlobalState.Consumer>
            {state => (
                <Fragment>
                    <div className={classes.backButtonRoot}>
                        <Button
                            className={classes.backButton}
                            onClick={() => history.goBack()}>
                            <ChevronLeftIcon fontSize='large' />
                        </Button>
                    </div>
                    <h1>Configuration</h1>
                    <FormControl>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    id='showDone'
                                    checked={state.config.showDone}
                                    onChange={ev =>
                                        dispatch({
                                            type: 'config',
                                            setting: 'showDone',
                                            value: ev.target.checked
                                        })
                                    }
                                />
                            }
                            label='Show finished tasks'
                        />
                    </FormControl>
                    <FormControl>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    id='showFutureStart'
                                    checked={!!state.config.showFutureStart}
                                    onChange={ev =>
                                        dispatch({
                                            type: 'config',
                                            setting: 'showFutureStart',
                                            value: ev.target.checked
                                        })
                                    }
                                />
                            }
                            label='Show tasks with a start date in the future'
                        />
                    </FormControl>
                </Fragment>
            )}
        </GlobalState.Consumer>
    );
}
