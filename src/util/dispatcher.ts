import { Task } from '../model/Task';
import { IGlobalState } from '../model/GlobalState';
import { sortAndUniqueString } from './order';

export interface ITaskAction {
    type: 'task';
    subtype: 'create' | 'update' | 'delete';
    task: Task;
}

export interface IContextAction {
    type: 'context';
    subtype: 'select' | 'deselect';
    context: string;
}

export interface IDispatchReceiver {
    dispatch: React.Dispatch<ITaskAction | IContextAction>;
}

function handleContextAction(
    newState: IGlobalState,
    action: IContextAction
): IGlobalState {
    switch (action.subtype) {
        case 'select':
            newState.selectedContexts.push(action.context);
            newState.selectedContexts = sortAndUniqueString(
                newState.selectedContexts
            );
            break;
        case 'deselect':
            var idx = newState.selectedContexts.findIndex(
                ctx => ctx === action.context
            );
            if (idx !== -1) {
                newState.selectedContexts.splice(idx, 1);
            }
            break;
    }
    return newState;
}

function handleTaskAction(newState: IGlobalState, action: ITaskAction) {
    switch (action.subtype) {
        case 'create':
            newState.tasks.push(action.task);
            break;
        case 'update':
            const updateIdx = newState.tasks.findIndex(task =>
                task.id.equals(action.task.id)
            );
            if (updateIdx !== -1) {
                newState.tasks.splice(
                    updateIdx,
                    1,
                    (action as ITaskAction).task
                );
            }
            break;
        case 'delete':
            const deleteIdx = newState.tasks.findIndex(task =>
                task.id.equals(action.task.id)
            );
            if (deleteIdx !== -1) {
                newState.tasks.splice(deleteIdx, 1);
            }
            break;
    }
    newState.contexts = extractContexts(newState.tasks);
    newState.projects = extractProjects(newState.tasks);
    newState.tags = extractTags(newState.tasks);
    return newState;
}

/**
 * The global reducer function handling application state transitions
 * @param state The current state of the applicatoin
 * @param action The action to update the global state
 */
export function reducer(
    state: IGlobalState,
    action: ITaskAction | IContextAction
): IGlobalState {
    const newState = { ...state };
    newState.tasks = [...state.tasks];
    switch (action.type) {
        case 'context':
            return handleContextAction(newState, action as IContextAction);
        case 'task':
            return handleTaskAction(newState, action as ITaskAction);
    }
    return state;
}

function extractContexts(tasks: Task[]): string[] {
    return sortAndUniqueString(tasks.flatMap(task => task.contexts || []));
}

function extractProjects(tasks: Task[]): string[] {
    return sortAndUniqueString(tasks.flatMap(task => task.projects || []));
}

function extractTags(tasks: Task[]): string[] {
    return sortAndUniqueString(tasks.flatMap(task => task.tags || []));
}
