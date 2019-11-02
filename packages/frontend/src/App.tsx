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
import { IDispatchReceiver, reducer } from './util/dispatcher';
import { IGlobalState, GlobalState } from './model/GlobalState';
import { LocalStorage } from './storage/LocalStorage';
import { MainView } from './components/MainView';

function FindTask(props: IDispatchReceiver) {
    const { id } = useParams();
    const taskId = id && Guid.parse(id);
    const state = useContext(GlobalState);

    const task: Task =
        (taskId && state.tasks.find(t => t.id.equals(taskId))) ||
        ({ id: Guid.create() } as Task);
    return <TaskEditor task={task} dispatch={props.dispatch} />;
}

const storage = new LocalStorage();

const App: React.FC = () => {
    const [state, dispatch] = useReducer(reducer.bind(null, storage), {
        tasks: [] as Task[],
        contexts: [] as string[],
        projects: [] as string[],
        tags: [] as string[],
        selectedContexts: [] as string[],
        selectedProjects: [] as string[],
        selectedTags: [] as string[]
    } as IGlobalState);
    useEffect(() => {
        storage
            .loadTasks()
            .then(tasks =>
                tasks.forEach(task =>
                    dispatch({ type: 'task', subtype: 'load', task: task })
                )
            );
    }, []);
    return (
        <Router>
            <GlobalState.Provider value={state}>
                <div className='App'>
                    <Switch>
                        <Route exact path='/'>
                            {/* <TaskOverview dispatch={dispatch} /> */}
                            <MainView dispatch={dispatch} />
                        </Route>
                        <Route path='/task/:id'>
                            <FindTask dispatch={dispatch} />
                        </Route>
                        <Route path='/newTask'>
                            <TaskEditor
                                task={{ id: Guid.create(), title: '' }}
                                isNew
                                dispatch={dispatch}
                            />
                        </Route>
                    </Switch>
                </div>
            </GlobalState.Provider>
        </Router>
    );
};

export default App;
