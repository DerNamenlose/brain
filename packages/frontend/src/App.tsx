import React, { useReducer, useContext, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    useParams
} from 'react-router-dom';
import './App.css';
import { Task } from 'brain-common';
import { Guid } from 'guid-typescript';
import { TaskEditor } from './components/TaskEditor';
import { stateReducer, configReducer, Dispatchers } from './util/dispatcher';
import { IGlobalState, GlobalState } from './model/GlobalState';
import { LocalStorage } from './storage/LocalStorage';
import { MainView } from './components/MainView';
import { createMuiTheme } from '@material-ui/core';
import { green, red } from '@material-ui/core/colors';
import { ThemeProvider } from '@material-ui/styles';
import { ConfigEditor } from './components/ConfigEditor';
import { GlobalConfig, IGlobalConfig } from './model/GlobalConfig';

function FindTask() {
    const { id } = useParams();
    const taskId = id && Guid.parse(id);
    const state = useContext(GlobalState);

    const task: Task =
        (taskId && state.tasks.find(t => t.id.equals(taskId))) ||
        ({ id: Guid.create() } as Task);
    return <TaskEditor task={task} />;
}

const storage = new LocalStorage();

const theme = createMuiTheme({
    palette: {
        primary: green,
        secondary: red
    }
});

const App: React.FC = () => {
    const [config, configDispatcher] = useReducer(
        configReducer,
        {} as IGlobalConfig
    );
    const [state, stateDispatcher] = useReducer(
        stateReducer.bind(null, storage),
        {
            tasks: [] as Task[],
            contexts: [] as string[],
            projects: [] as string[],
            tags: [] as string[],
            selectedContexts: [] as string[],
            selectedProjects: [] as string[],
            selectedTags: [] as string[]
        } as IGlobalState
    );
    useEffect(() => {
        storage
            .loadTasks()
            .then(tasks =>
                stateDispatcher({ type: 'bulk', subtype: 'load', tasks: tasks })
            );
    }, []);
    return (
        <Router>
            <Dispatchers.Provider
                value={{ state: stateDispatcher, config: configDispatcher }}>
                <GlobalConfig.Provider value={config}>
                    <GlobalState.Provider value={state}>
                        <ThemeProvider theme={theme}>
                            <div className='App'>
                                <Switch>
                                    <Route
                                        exact
                                        path={['/', '/inbox', '/someday']}>
                                        <MainView />
                                    </Route>
                                    <Route path='/task/:id'>
                                        <FindTask />
                                    </Route>
                                    <Route path='/newTask'>
                                        <TaskEditor
                                            task={{
                                                id: Guid.create(),
                                                title: '',
                                                version: 0,
                                                hash: ''
                                            }}
                                            isNew
                                        />
                                    </Route>
                                    <Route path='/config'>
                                        <ConfigEditor />
                                    </Route>
                                </Switch>
                            </div>
                        </ThemeProvider>
                    </GlobalState.Provider>
                </GlobalConfig.Provider>
            </Dispatchers.Provider>
        </Router>
    );
};

export default App;
