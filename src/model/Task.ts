import { Guid } from 'guid-typescript';

export interface Task {
    id: Guid;
    title: string;
    description?: string;
    due?: Date;
    done?: boolean;
    contexts?: string[];
    projects?: string[];
    tags?: string[];
}
