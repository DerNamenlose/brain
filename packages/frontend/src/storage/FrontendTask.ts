import { Task } from 'brain-common';

/**
 * The task type stored in the frontend with additional fields for keeping
 * track of synchronization status, conflicts etc.
 */
export interface FrontendTask extends Task {
    /**
     * flag indicating, that the was synced since its last update
     */
    sync?: boolean;
}
