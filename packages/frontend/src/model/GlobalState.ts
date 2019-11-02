import { Task } from 'brain-common';
import React from 'react';

export interface IGlobalState {
    tasks: Task[];
    contexts: string[];
    projects: string[];
    tags: string[];
    selectedContexts: string[];
    selectedProjects: string[];
    selectedTags: string[];
    inboxEmpty: boolean;
    somedayMaybeEmpty: boolean;
}

export const GlobalState = React.createContext({} as IGlobalState);
