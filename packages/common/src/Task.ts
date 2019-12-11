export type TaskPrio = undefined | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

/**
 * The base interface of a task shared by all users
 */
export interface TaskBase {
    title: string;
    description?: string;
    priority?: TaskPrio;
    due?: number;
    created?: number;
    done?: boolean;
    contexts?: string[];
    projects?: string[];
    tags?: string[];
    postponed?: boolean; // if an item is postponed, it's visible in the Someday/Maybe list
    version?: number; // legacy version number
    hash?: string; // a hash used for detecting collisions during updates
    start?: number; // the earliest day a task is to be started
    owner: string; // the owner of this task
    access?: string[]; // names of users, that have access to the task
}

/**
 * Base interface of all forms of the task. Basically contains the different
 * fields, shared by all instances
 */
export interface Task extends TaskBase {
    id: string;
}

/**
 * The form of a task currently stored in the deployed version
 * Only needed for the update code and should appear nowhere else
 */
export interface LegacyTask {
    id: string;
    title: string;
    description?: string;
    priority?: TaskPrio;
    due?: Date;
    created?: Date;
    done?: boolean;
    contexts?: string[];
    projects?: string[];
    tags?: string[];
    postponed?: boolean; // if an item is postponed, it's visible in the Someday/Maybe list
}
