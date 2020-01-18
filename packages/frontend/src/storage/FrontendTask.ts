import { Task } from 'brain-common';
import { SyncState } from './TaskStateMachine';

/**
 * The task type stored in the frontend with additional fields for keeping
 * track of synchronization status, conflicts etc.
 */
export interface FrontendTask extends Task {
    /**
     * The current synchronization state of the task
     */
    syncState: SyncState;

    /**
     * If a task in a conflicted state, this field contains the
     * conflicting version sent by the server
     */
    conflictingVersion?: Task;
}
