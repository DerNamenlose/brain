import { IDispatchReceiver } from '../util/dispatcher';
import {
    Tab,
    Tabs,
    Typography,
    Box,
    Fab,
    Theme,
    Hidden,
    useMediaQuery
} from '@material-ui/core';
import InboxIcon from '@material-ui/icons/Inbox';
import ListIcon from '@material-ui/icons/List';
import SwipeableViews from 'react-swipeable-views';
import AddIcon from '@material-ui/icons/Add';
import React, { Fragment, useState } from 'react';
import { useTheme, makeStyles, createStyles } from '@material-ui/styles';
import { TaskOverview } from './TaskOverview';
import { Inbox } from './Inbox';
import { useHistory } from 'react-router';

interface TabPanelProps {
    value: number;
    index: number;
    children?: React.ReactNode;
}

function TabPanel(props: TabPanelProps) {
    return (
        <Typography
            component='div'
            hidden={props.value !== props.index}
            role='tabpanel'
            id={`full-width-tabpanel-${props.index}`}>
            {props.children}
        </Typography>
    );
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        addButton: {
            position: 'absolute',
            zIndex: 1,
            bottom: 75,
            left: 0,
            right: 0,
            marginLeft: 'auto',
            marginRight: 10
        }
    })
);

export function MainView(props: IDispatchReceiver) {
    const history = useHistory();
    const classes = useStyles();
    const [value, setValue] = useState(0);
    const smallScreen = useMediaQuery(
        /*(theme: Theme) =>   theme.breakpoints.down('xs') */
        '(max-width: 600px)'
    );
    console.log(smallScreen);
    return (
        <Fragment>
            <Tabs
                variant='fullWidth'
                onChange={(ev, newValue) => {
                    setValue(newValue);
                }}
                indicatorColor='primary'
                value={value}>
                <Tab
                    icon={<ListIcon />}
                    label={smallScreen ? undefined : 'Tasks'}
                    aria-label='Tasks'
                />
                <Tab
                    icon={<InboxIcon />}
                    label={smallScreen ? undefined : 'Inbox'}
                    aria-label='Inbox'
                />
            </Tabs>
            {/* <SwipeableViews
                axis='x'
                index={value}
                onChangeIndex={newValue => {
                    setValue(newValue);
                }}
                style={{
                    top: 'auto',
                    bottom: 0
                }}> */}
            <TabPanel value={value} index={0}>
                <TaskOverview dispatch={props.dispatch} />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <Inbox dispatch={props.dispatch} />
            </TabPanel>
            <Fab
                color='secondary'
                aria-label='add'
                className={classes.addButton}
                onClick={() => history.push('/newTask')}>
                <AddIcon />
            </Fab>
            {/* </SwipeableViews> */}
        </Fragment>
    );
}
