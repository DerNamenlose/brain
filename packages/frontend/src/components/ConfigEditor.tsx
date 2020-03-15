import React, { useContext, useState } from 'react';
import {
    FormControl,
    Checkbox,
    FormControlLabel,
    Button,
    Input,
    Theme
} from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Dispatcher } from '../util/dispatcher';
import { useHistory } from 'react-router';
import { GlobalState } from '../model/GlobalState';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        backButton: {
            marginLeft: 0,
            marginRight: 'auto'
        },
        backButtonRoot: {
            display: 'flex'
        },
        configEntry: {
            display: 'block',
            marginLeft: 'auto'
        },
        entryGroup: {
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: theme.palette.divider,
            paddingBottom: '1rem'
        }
    })
);

function TaskCleanupConfiguration(props: {
    cleanupDays?: number;
    onChange: (newValue?: number) => void;
}) {
    const classes = useStyles();
    const [cleanUpTime, setCleanUpTime] = useState(props.cleanupDays ?? 30);
    const [doCleanUp, setDoCleanUp] = useState(!!props.cleanupDays);
    return (
        <div className={classes.entryGroup}>
            <FormControl className={classes.configEntry}>
                <FormControlLabel
                    className={classes.configEntry}
                    control={
                        <Checkbox
                            id='cleanupOldTasks'
                            checked={doCleanUp}
                            onChange={ev => {
                                // the onChange condition seems to be the wrong way around, because we emit before we toggle
                                props.onChange(
                                    !doCleanUp ? cleanUpTime : undefined
                                );
                                setDoCleanUp(!doCleanUp);
                            }}
                        />
                    }
                    label='Clean up old tasks'
                />
            </FormControl>
            <FormControl className={classes.configEntry}>
                <FormControlLabel
                    control={
                        <Input
                            type='number'
                            id='taskCleanupDays'
                            value={cleanUpTime}
                            disabled={!doCleanUp}
                            inputProps={{
                                min: 1,
                                max: 730
                            }}
                            onChange={ev => {
                                const newValue = ev.target.validity
                                    .rangeOverflow
                                    ? 730
                                    : ev.target.validity.rangeUnderflow
                                    ? 1
                                    : parseInt(ev.target.value);
                                props.onChange(newValue);
                                setCleanUpTime(newValue);
                            }}
                        />
                    }
                    labelPlacement='top'
                    label='Remove finished tasks older than (days)'
                />
            </FormControl>
        </div>
    );
}

export function ConfigEditor() {
    const classes = useStyles();
    const dispatch = useContext(Dispatcher);
    const history = useHistory();
    const state = useContext(GlobalState);
    return (
        <div
            style={{
                marginLeft: '1rem',
                marginRight: '1rem'
            }}>
            <div className={classes.backButtonRoot}>
                <Button
                    className={classes.backButton}
                    onClick={() => history.goBack()}>
                    <ChevronLeftIcon fontSize='large' />
                </Button>
            </div>
            <h1>Configuration</h1>
            <FormControl className={classes.configEntry}>
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
            <FormControl className={classes.configEntry}>
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
            <TaskCleanupConfiguration
                cleanupDays={state.config.taskCleanupDays}
                onChange={newValue =>
                    dispatch({
                        type: 'config',
                        setting: 'taskCleanupDays',
                        value: newValue
                    })
                }
            />
        </div>
    );
}
