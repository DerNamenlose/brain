import { Guid } from 'guid-typescript';
import { Project } from './Project';

export interface Task {
    id: Guid;
    title: string;
    description?: string;
    due?: Date;
    done?: boolean;
    contexts?: string[];
    projects?: Project[];
    tags?: string[];
}
