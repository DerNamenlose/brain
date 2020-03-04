export type TaskPrio = undefined | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

/**
 * Base interface of all forms of the task. Basically contains the different
 * fields, shared by all instances
 */
export interface Task {
    id: string;
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
    delegatedTo?: string; // if an item is delegated, is visible in the delegated list
    version: number; // a version number indicating the relative age of the element
    hash: string; // a hash used for detecting collisions during updates
    start?: number; // the earliest day a task is to be started
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
