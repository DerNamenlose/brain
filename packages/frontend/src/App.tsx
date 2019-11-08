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
import { reduce, Dispatcher } from './util/dispatcher';
import { IGlobalState, GlobalState } from './model/GlobalState';
import { LocalStorage } from './storage/LocalStorage';
import { MainView } from './components/MainView';
import { createMuiTheme } from '@material-ui/core';
import { green, red } from '@material-ui/core/colors';
import { ThemeProvider } from '@material-ui/styles';
import { ConfigEditor } from './components/ConfigEditor';

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
    const [state, dispatch] = useReducer(reduce.bind(null, storage), {
        tasks: [] as Task[],
        contexts: [] as string[],
        projects: [] as string[],
        tags: [] as string[],
        selectedContexts: [] as string[],
        selectedProjects: [] as string[],
        selectedTags: [] as string[],
        config: { showDone: false }
    } as IGlobalState);
    useEffect(() => {
        storage
            .loadTasks()
            .then(tasks =>
                dispatch({ type: 'bulk', subtype: 'load', tasks: tasks })
            );
        storage
            .config()
            .then(config => dispatch({ type: 'loadConfig', config: config }));
    }, []);
    return (
        <Router>
            <Dispatcher.Provider value={dispatch}>
                <GlobalState.Provider value={state}>
                    <ThemeProvider theme={theme}>
                        <div className='App'>
                            <Switch>
                                <Route exact path={['/', '/inbox', '/someday']}>
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
            </Dispatcher.Provider>
        </Router>
    );
};

export default App;
