import { Task } from '../model/Task';
import { IGlobalState } from '../model/GlobalState';
import { sortAndUnique, sortAndUniqueString } from './order';

export interface IAction {
    type:
        | 'task.create'
        | 'task.update'
        | 'task.delete'
        | 'context.select'
        | 'context.deselect';
}

export interface ITaskAction extends IAction {
    task: Task;
}

export interface IContextAction extends IAction {
    context: string;
}

export interface IDispatchReceiver {
    dispatch: React.Dispatch<IAction>;
}

/**
 * The global reducer function handling application state transitions
 * @param state The current state of the applicatoin
 * @param action The action to update the global state
 */
export function reducer(state: IGlobalState, action: IAction): IGlobalState {
    const newState = { ...state };
    newState.tasks = [...state.tasks];
    switch (action.type) {
        case 'task.create':
            newState.tasks.push((action as ITaskAction).task);
            break;
        case 'task.update':
            const updateIdx = newState.tasks.findIndex(task =>
                task.id.equals((action as ITaskAction).task.id)
            );
            if (updateIdx !== -1) {
                newState.tasks.splice(
                    updateIdx,
                    1,
                    (action as ITaskAction).task
                );
            }
            break;
        case 'task.delete':
            const deleteIdx = newState.tasks.findIndex(task =>
                task.id.equals((action as ITaskAction).task.id)
            );
            if (deleteIdx !== -1) {
                newState.tasks.splice(deleteIdx, 1);
            }
            break;
        case 'context.select':
            newState.selectedContexts.push((action as IContextAction).context);
            newState.selectedContexts = sortAndUniqueString(
                newState.selectedContexts
            );
            break;
        case 'context.deselect':
            var idx = newState.selectedContexts.findIndex(
                ctx => ctx === (action as IContextAction).context
            );
            if (idx !== -1) {
                newState.selectedContexts.splice(idx, 1);
            }
            break;
    }
    return newState;
}
