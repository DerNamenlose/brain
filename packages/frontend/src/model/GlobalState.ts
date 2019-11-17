import { Task } from 'brain-common';
import React from 'react';
import { IGlobalConfig } from './GlobalConfig';

export interface IGlobalState {
    tasks: Task[];
    contexts: string[];
    projects: string[];
    tags: string[];
    inboxEmpty: boolean;
    somedayMaybeEmpty: boolean;
    config: IGlobalConfig;
}

export const GlobalState = React.createContext({} as IGlobalState);
