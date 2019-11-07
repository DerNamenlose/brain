import { Guid } from 'guid-typescript';

export type TaskPrio = undefined | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

/**
 * Base interface of all forms of the task. Basically contains the different
 * fields, shared by all instances
 */
interface TaskBase {
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
    version: number; // a version number indicating the relative age of the element
    hash: string; // a hash used for detecting collisions during updates
}

/**
 * Interface of task objects as transported on the wire
 */
export interface TaskDto extends TaskBase {
    id: string;
}

/**
 * The task as stored in the IndexDB (and possibly on the backend as well)
 */
export interface Task extends TaskBase {
    id: Guid;
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
