import React from 'react';
import { Task } from 'brain-common';
import { IGlobalState } from '../model/GlobalState';
import { sortAndUniqueString } from './order';
import { LocalStorage } from '../storage/LocalStorage';
import { inboxFilter, somedayMaybeFilter } from './Filter';
import { IGlobalConfig } from '../model/GlobalConfig';
import { config } from 'react-transition-group';

export interface ITaskAction {
    type: 'task';
    subtype: 'create' | 'update' | 'delete' | 'load';
    task: Task;
}

export interface ITaskBulkAction {
    type: 'bulk';
    subtype: 'load';
    tasks: Task[];
}

export function taskAction(
    task: Task,
    action: 'create' | 'update' | 'delete' | 'load'
): ITaskAction {
    return {
        type: 'task',
        subtype: action,
        task: task
    };
}

export interface IFilterAction {
    type: 'context' | 'project' | 'tag';
    subtype: 'select' | 'deselect';
    name: string;
}

export interface IDueFilterAction {
    type: 'due';
    subtype: 'select' | 'deselect';
    value?: number;
}

export interface IConfigAction {
    type: 'loadConfig';
    config: IGlobalConfig;
}

export interface IConfigChangeAction {
    type: 'config';
    setting: keyof IGlobalConfig;
    value: any;
}

function handleFilterAction(
    newState: IGlobalState,
    action: IFilterAction
): IGlobalState {
    let items: string[] = [];
    switch (action.type) {
        case 'context':
            items = [...newState.config.selectedContexts];
            break;
        case 'project':
            items = [...newState.config.selectedProjects];
            break;
        case 'tag':
            items = [...newState.config.selectedTags];
            break;
    }
    switch (action.subtype) {
        case 'select':
            items.push(action.name);
            items = sortAndUniqueString(items);
            break;
        case 'deselect':
            var idx = items.findIndex(ctx => ctx === action.name);
            if (idx !== -1) {
                items.splice(idx, 1);
            }
            break;
    }
    switch (action.type) {
        case 'context':
            newState.config.selectedContexts = items;
            break;
        case 'project':
            newState.config.selectedProjects = items;
            break;
        case 'tag':
            newState.config.selectedTags = items;
            break;
    }
    return newState;
}

function handleTaskAction(
    storage: LocalStorage,
    newState: IGlobalState,
    action: ITaskAction
) {
    switch (action.subtype) {
        case 'create':
            action.task.created = Date.now();
            newState.tasks.push(action.task);
            storage.create(action.task);
            break;
        case 'update':
            const updateIdx = newState.tasks.findIndex(task =>
                task.id.equals(action.task.id)
            );
            if (updateIdx !== -1) {
                newState.tasks.splice(
                    updateIdx,
                    1,
                    (action as ITaskAction).task
                );
            }
            storage.update(action.task);
            break;
        case 'delete':
            const deleteIdx = newState.tasks.findIndex(task =>
                task.id.equals(action.task.id)
            );
            if (deleteIdx !== -1) {
                newState.tasks.splice(deleteIdx, 1);
            }
            break;
        case 'load':
            newState.tasks.push(action.task);
            break;
    }
    return newState;
}

function handleTaskBulkAction(newState: IGlobalState, action: ITaskBulkAction) {
    switch (action.subtype) {
        case 'load':
            newState.tasks = newState.tasks.concat(action.tasks);
            break;
    }
    return newState;
}

function handleDueFilterAction(
    newState: IGlobalState,
    action: IDueFilterAction
) {
    if (action.subtype === 'deselect') {
        newState.config.dueIn = undefined;
    } else {
        newState.config.dueIn = action.value;
    }
    return newState;
}

/**
 * The global reducer function handling application state transitions
 * @param state The current state of the applicatoin
 * @param action The action to update the global state
 */
export function reduce(
    storage: LocalStorage,
    state: IGlobalState,
    action:
        | ITaskAction
        | ITaskBulkAction
        | IFilterAction
        | IDueFilterAction
        | IConfigChangeAction
        | IConfigAction
): IGlobalState {
    let newState = { ...state };
    newState.tasks = [...state.tasks];
    switch (action.type) {
        case 'context':
        case 'project':
        case 'tag':
            newState = handleFilterAction(newState, action as IFilterAction);
            break;
        case 'task':
            newState = handleTaskAction(
                storage,
                newState,
                action as ITaskAction
            );
            break;
        case 'bulk':
            newState = handleTaskBulkAction(
                newState,
                action as ITaskBulkAction
            );
            break;
        case 'due':
            newState = handleDueFilterAction(
                newState,
                action as IDueFilterAction
            );
            break;
        case 'config':
            newState = handleConfigAction(
                storage,
                newState,
                action as IConfigChangeAction
            );
            break;
        case 'loadConfig':
            newState.config = action.config;
            newState.config.selectedContexts =
                newState.config.selectedContexts || [];
            newState.config.selectedProjects =
                newState.config.selectedProjects || [];
            newState.config.selectedTags = newState.config.selectedTags || [];
    }
    newState.contexts = extractContexts(newState.tasks, newState.config);
    newState.projects = extractProjects(newState.tasks, newState.config);
    newState.tags = extractTags(newState.tasks, newState.config);
    newState.config.selectedContexts = newState.config.selectedContexts.filter(
        sctx => !!newState.contexts.find(ctx => sctx === ctx)
    );
    newState.config.selectedProjects = newState.config.selectedProjects.filter(
        sp => !!newState.projects.find(p => p === sp)
    );
    newState.config.selectedTags = newState.config.selectedTags.filter(
        st => !!newState.tags.find(t => t === st)
    );
    storage.putConfig(newState.config);
    newState.inboxEmpty =
        inboxFilter(newState.config, newState.tasks).length === 0;
    newState.somedayMaybeEmpty =
        somedayMaybeFilter(newState.tasks).length === 0;
    return newState;
}

function extractContexts(tasks: Task[], config: IGlobalConfig): string[] {
    return sortAndUniqueString(
        tasks
            .filter(task => config.showDone || !task.done)
            .flatMap(task => task.contexts || [])
    );
}

function extractProjects(tasks: Task[], config: IGlobalConfig): string[] {
    return sortAndUniqueString(
        tasks
            .filter(task => config.showDone || !task.done)
            .flatMap(task => task.projects || [])
    );
}

function extractTags(tasks: Task[], config: IGlobalConfig): string[] {
    return sortAndUniqueString(
        tasks
            .filter(task => config.showDone || !task.done)
            .flatMap(task => task.tags || [])
    );
}

export function handleConfigAction(
    storage: LocalStorage,
    newState: IGlobalState,
    action: IConfigChangeAction
): IGlobalState {
    newState.config = {
        ...newState.config,
        [action.setting]: action.value
    };
    storage.putConfig(newState.config);
    return newState;
}

export const Dispatcher = React.createContext<
    React.Dispatch<
        | ITaskAction
        | ITaskBulkAction
        | IFilterAction
        | IDueFilterAction
        | IConfigChangeAction
    >
>(ev => {});
