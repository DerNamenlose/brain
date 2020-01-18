import { FrontendTask } from './FrontendTask';
import { Task } from 'brain-common';

/**
 * The possible synchronization states a frontend task can be in
 */
export type SyncState = 'Start' | 'Sync' | 'Changed' | 'Conflict';

/**
 * The possible events, that can occur in the update of the frontend task
 */
export type SyncEvent =
    | 'Create'
    | 'Update'
    | 'RemoteUpdate'
    | 'Uploaded'
    | 'Accept';

export function handleEvent(
    task: FrontendTask,
    ev: SyncEvent,
    newState: Task
): FrontendTask {
    switch (task.syncState) {
        case 'Start':
            switch (ev) {
                case 'RemoteUpdate':
                    return { ...task, syncState: 'Sync' };
                case 'Create':
                    return { ...task, syncState: 'Changed' };
            }
            break;
        case 'Sync':
            if (ev === 'Update') {
                return { ...task, syncState: 'Changed' };
            }
            break;
        case 'Changed':
            switch (ev) {
                case 'Uploaded':
                    return { ...task, syncState: 'Sync' };
                case 'RemoteUpdate':
                    // TODO
                    break;
            }
            break;
        case 'Conflict':
            switch (ev) {
                case 'Accept': {
                    const { conflictingVersion, ...newtask } = task;
                    return { ...newtask, syncState: 'Sync' };
                }
                case 'RemoteUpdate':
                    // TODO: check local and remote states for equality
                    break;
                case 'Update': {
                    const { conflictingVersion, ...newtask } = task;
                    return { ...newtask, syncState: 'Changed' };
                }
            }
            break;
    }
    throw Error(`Invalid event ${ev} in state ${task.syncState}`);
}
