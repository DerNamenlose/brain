import React, { Fragment } from 'react';
import {
    FormControl,
    Checkbox,
    FormControlLabel,
    Button,
    AppBar
} from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { IDispatchReceiver } from '../util/dispatcher';
import { makeStyles, createStyles } from '@material-ui/styles';

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

export function ConfigEditor(props: IDispatchReceiver) {
    const classes = useStyles();
    return (
        <Fragment>
            <div className={classes.backButtonRoot}>
                <Button className={classes.backButton}>
                    <ChevronLeftIcon fontSize='large' />
                </Button>
            </div>
            <h1>Configuration</h1>
            <FormControl>
                <FormControlLabel
                    control={<Checkbox id='showDone' />}
                    label='Show finished tasks'
                />
            </FormControl>
        </Fragment>
    );
}
