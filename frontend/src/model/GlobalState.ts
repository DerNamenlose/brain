import { Task } from './Task';
import React from 'react';

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
