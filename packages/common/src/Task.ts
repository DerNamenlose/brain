import { Guid } from 'guid-typescript';

export type TaskPrio = undefined | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface Task {
    id: Guid;
    title: string;
    description?: string;
    priority?: TaskPrio;
    due?: Date;
    done?: boolean;
    contexts?: string[];
    projects?: string[];
    tags?: string[];
    postponed?: boolean; // if an item is postponed, it's visible in the Someday/Maybe list
}
