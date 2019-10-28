import { Task } from './Task';
import React from 'react';
import { sortAndUnique, sortAndUniqueString } from '../util/order';

export interface IGlobalState {
    tasks: Task[];
    selectedContexts: string[];
    selectedProjects: string[];
    selectedTags: string[];
}

export function extractContexts(tasks: Task[]): string[] {
    return sortAndUniqueString(tasks.flatMap(task => task.contexts || []));
}

export function extractProjects(tasks: Task[]): string[] {
    return sortAndUniqueString(tasks.flatMap(task => task.projects || []));
}

export function extractTags(tasks: Task[]): string[] {
    return sortAndUniqueString(tasks.flatMap(task => task.tags || []));
}

export const GlobalState = React.createContext({} as IGlobalState);
