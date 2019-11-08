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
import React, { Fragment } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { TaskOverview } from './TaskOverview';
import { Inbox } from './Inbox';
import { SomedayMaybe } from './SomedayMaybe';
import { useHistory, Route, Switch } from 'react-router';
import { GlobalState } from '../model/GlobalState';

interface TabPanelProps {
    index: number;
    children?: React.ReactNode;
}

function TabPanel(props: TabPanelProps) {
    return (
        <Typography
            component='div'
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

function TabHeader(props: {
    path: string;
    inboxEmpty: boolean;
    somedayMaybeEmpty: boolean;
}) {
    const history = useHistory();
    const classes = useStyles();
    const smallScreen = useMediaQuery((theme: Theme) =>
        theme.breakpoints.down('xs')
    );
    return (
        <Tabs
            variant='fullWidth'
            indicatorColor='primary'
            value={props.path}
            className={classes.tabs}>
            <Tab
                icon={<ListIcon />}
                label={smallScreen ? undefined : 'Tasks'}
                aria-label='Tasks'
                value='/'
                onClick={ev => history.push('/')}
            />
            <Tab
                icon={<InboxIcon />}
                label={smallScreen ? undefined : 'Inbox'}
                aria-label='Inbox'
                disabled={props.inboxEmpty}
                value='/inbox'
                onClick={ev => history.push('/inbox')}
            />
            <Tab
                icon={<AllInclusiveIcon />}
                label={smallScreen ? undefined : 'Someday/Maybe'}
                aria-label='Inbox'
                disabled={props.somedayMaybeEmpty}
                value='/someday'
                onClick={ev => history.push('/someday')}
            />
        </Tabs>
    );
}

function TabContent() {
    const classes = useStyles();
    const smallScreen = useMediaQuery((theme: Theme) =>
        theme.breakpoints.down('xs')
    );
    return (
        <div
            className={`${classes.tabPanel} ${
                smallScreen ? classes.smallBorder : classes.normalBorder
            }`}>
            <Switch>
                <Route exact path='/'>
                    <TabPanel index={0}>
                        <TaskOverview />
                    </TabPanel>
                </Route>
                <Route path='/inbox'>
                    <TabPanel index={1}>
                        <Inbox />
                    </TabPanel>
                </Route>
                <Route path='/someday'>
                    <TabPanel index={2}>
                        <SomedayMaybe />
                    </TabPanel>
                </Route>
            </Switch>
        </div>
    );
}

export function MainView() {
    const history = useHistory();
    const classes = useStyles();
    return (
        <GlobalState.Consumer>
            {state => (
                <Route
                    render={match => (
                        <Fragment>
                            <TabHeader
                                path={match.location.pathname}
                                inboxEmpty={state.inboxEmpty}
                                somedayMaybeEmpty={state.somedayMaybeEmpty}
                            />
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
                            <TabContent />
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
                />
            )}
        </GlobalState.Consumer>
    );
}
