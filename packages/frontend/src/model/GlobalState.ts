import { Task } from 'brain-common';
import React from 'react';
import { IGlobalConfig } from './GlobalConfig';

export interface IGlobalState {
    tasks: Task[];
    contexts: string[];
    projects: string[];
    tags: string[];
    dueIn?: number; // filter for the maximum number of days in which an item may be due to be shown
    selectedContexts: string[];
    selectedProjects: string[];
    selectedTags: string[];
    inboxEmpty: boolean;
    somedayMaybeEmpty: boolean;
    config: IGlobalConfig;
}

export const GlobalState = React.createContext({} as IGlobalState);
