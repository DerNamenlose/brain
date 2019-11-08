import React, { Fragment } from 'react';
import {
    FormControl,
    Checkbox,
    FormControlLabel,
    Button,
    AppBar
} from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { makeStyles, createStyles } from '@material-ui/styles';
import { GlobalConfig } from '../model/GlobalConfig';

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
    return (
        <GlobalConfig.Consumer>
            {config => (
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
                            checked={config.showDone}
                        />
                    </FormControl>
                </Fragment>
            )}
        </GlobalConfig.Consumer>
    );
}
