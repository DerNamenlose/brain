import { Task } from './Task';
import { Project } from './Project';
import React from 'react';
import { sortAndUnique, sortAndUniqueString } from '../util/order';

export interface IGlobalState {
    tasks: Task[];
    selectedContexts: string[];
    selectedProjects: Project[];
    selectedTags: string[];
}

export function extractContexts(tasks: Task[]): string[] {
    return sortAndUniqueString(tasks.flatMap(task => task.contexts || []));
}

export function extractProjects(tasks: Task[]): Project[] {
    return sortAndUnique(tasks.flatMap(task => task.projects || []), (p1, p2) =>
        p1.title.localeCompare(p2.title)
    );
}

export const GlobalState = React.createContext({} as IGlobalState);
