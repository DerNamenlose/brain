import React, { useReducer, useContext } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    useParams
} from 'react-router-dom';
import './App.css';
import { Task } from './model/Task';
import { Guid } from 'guid-typescript';
import { TaskOverview } from './components/TaskOverview';
import { TaskEditor } from './components/TaskEditor';
import { IDispatchReceiver, reducer } from './util/dispatcher';
import { IGlobalState, GlobalState } from './model/GlobalState';

function FindTask(props: IDispatchReceiver) {
    const { id } = useParams();
    const taskId = id && Guid.parse(id);
    const state = useContext(GlobalState);

    const task: Task =
        (taskId && state.tasks.find(t => t.id.equals(taskId))) ||
        ({ id: Guid.create() } as Task);
    return <TaskEditor task={task} dispatch={props.dispatch} />;
}

const App: React.FC = () => {
    const [state, dispatch] = useReducer(reducer, {
        tasks: [] as Task[],
        selectedContexts: [] as string[],
        selectedProjects: [] as string[],
        selectedTags: [] as string[]
    } as IGlobalState);
    return (
        <Router>
            <GlobalState.Provider value={state}>
                <div className='App'>
                    <Switch>
                        <Route exact path='/'>
                            <TaskOverview dispatch={dispatch} />
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
