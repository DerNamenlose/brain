import { Task } from './Task';
import React from 'react';
import { sortAndUnique, sortAndUniqueString } from '../util/order';

export interface IGlobalState {
    tasks: Task[];
    contexts: string[];
    projects: string[];
    tags: string[];
    selectedContexts: string[];
    selectedProjects: string[];
    selectedTags: string[];
}

export const GlobalState = React.createContext({} as IGlobalState);
