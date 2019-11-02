import { IDispatchReceiver } from '../util/dispatcher';
import {
    Tab,
    Tabs,
    Typography,
    Fab,
    Theme,
    useMediaQuery
} from '@material-ui/core';
import InboxIcon from '@material-ui/icons/Inbox';
import ListIcon from '@material-ui/icons/List';
import AddIcon from '@material-ui/icons/Add';
import AllInclusiveIcon from '@material-ui/icons/AllInclusive';
import React, { Fragment, useState } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { TaskOverview } from './TaskOverview';
import { Inbox } from './Inbox';
import { SomedayMaybe } from './SomedayMaybe';
import { useHistory } from 'react-router';
import { GlobalState } from '../model/GlobalState';

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
            position: 'fixed',
            zIndex: 1,
            bottom: 75,
            left: 0,
            right: 0,
            marginLeft: 'auto',
            marginRight: 10
        },
        tabs: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 1
        },
        tabPanel: {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            overflowY: 'auto'
        },
        smallBorder: {
            marginTop: theme.spacing(6),
            marginBottom: theme.spacing(6)
        },
        normalBorder: {
            marginTop: theme.spacing(9),
            marginBottom: theme.spacing(8)
        }
    })
);

export function MainView(props: IDispatchReceiver) {
    const history = useHistory();
    const classes = useStyles();
    const [value, setValue] = useState(0);
    const smallScreen = useMediaQuery((theme: Theme) =>
        theme.breakpoints.down('xs')
    );
    return (
        <GlobalState.Consumer>
            {state => (
                <Fragment>
                    <Tabs
                        variant='fullWidth'
                        onChange={(ev, newValue) => {
                            setValue(newValue);
                        }}
                        indicatorColor='primary'
                        value={value}
                        className={classes.tabs}>
                        <Tab
                            icon={<ListIcon />}
                            label={smallScreen ? undefined : 'Tasks'}
                            aria-label='Tasks'
                        />
                        <Tab
                            icon={<InboxIcon />}
                            label={smallScreen ? undefined : 'Inbox'}
                            aria-label='Inbox'
                            disabled={state.inboxEmpty}
                        />
                        <Tab
                            icon={<AllInclusiveIcon />}
                            label={smallScreen ? undefined : 'Someday/Maybe'}
                            aria-label='Inbox'
                            disabled={state.somedayMaybeEmpty}
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
                    <div
                        className={`${classes.tabPanel} ${
                            smallScreen
                                ? classes.smallBorder
                                : classes.normalBorder
                        }`}>
                        <TabPanel value={value} index={0}>
                            <TaskOverview dispatch={props.dispatch} />
                        </TabPanel>
                        <TabPanel value={value} index={1}>
                            <Inbox dispatch={props.dispatch} />
                        </TabPanel>
                        <TabPanel value={value} index={2}>
                            <SomedayMaybe dispatch={props.dispatch} />
                        </TabPanel>
                    </div>
                    <Fab
                        color='secondary'
                        aria-label='add'
                        className={classes.addButton}
                        onClick={() => history.push('/newTask')}>
                        <AddIcon />
                    </Fab>
                    {/* </SwipeableViews> */}
                </Fragment>
            )}
        </GlobalState.Consumer>
    );
}
