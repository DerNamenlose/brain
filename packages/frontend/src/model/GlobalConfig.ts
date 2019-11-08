import React from 'react';

export interface IGlobalConfig {
    showDone: boolean;
}

export const GlobalConfig = React.createContext({} as IGlobalConfig);
