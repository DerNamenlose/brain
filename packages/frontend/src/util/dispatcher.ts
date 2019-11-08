import React from 'react';
import { Task } from 'brain-common';
import { IGlobalState } from '../model/GlobalState';
import { sortAndUniqueString } from './order';
import { LocalStorage } from '../storage/LocalStorage';
import { inboxFilter, somedayMaybeFilter } from './Filter';
import { IGlobalConfig } from '../model/GlobalConfig';

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
            items = [...newState.selectedContexts];
            break;
        case 'project':
            items = [...newState.selectedProjects];
            break;
        case 'tag':
            items = [...newState.selectedTags];
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
            newState.selectedContexts = items;
            break;
        case 'project':
            newState.selectedProjects = items;
            break;
        case 'tag':
            newState.selectedTags = items;
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
    newState.contexts = extractContexts(newState.tasks);
    newState.projects = extractProjects(newState.tasks);
    newState.tags = extractTags(newState.tasks);
    newState.inboxEmpty = inboxFilter(newState.tasks).length === 0;
    newState.somedayMaybeEmpty =
        somedayMaybeFilter(newState.tasks).length === 0;
    return newState;
}

function handleTaskBulkAction(newState: IGlobalState, action: ITaskBulkAction) {
    switch (action.subtype) {
        case 'load':
            newState.tasks = newState.tasks.concat(action.tasks);
            break;
    }
    newState.contexts = extractContexts(newState.tasks);
    newState.projects = extractProjects(newState.tasks);
    newState.tags = extractTags(newState.tasks);
    newState.inboxEmpty = inboxFilter(newState.tasks).length === 0;
    newState.somedayMaybeEmpty =
        somedayMaybeFilter(newState.tasks).length === 0;
    return newState;
}

function handleDueFilterAction(
    newState: IGlobalState,
    action: IDueFilterAction
) {
    if (action.subtype === 'deselect') {
        newState.dueIn = undefined;
    } else {
        newState.dueIn = action.value;
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
): IGlobalState {
    const newState = { ...state };
    newState.tasks = [...state.tasks];
    switch (action.type) {
        case 'context':
        case 'project':
        case 'tag':
            return handleFilterAction(newState, action as IFilterAction);
        case 'task':
            return handleTaskAction(storage, newState, action as ITaskAction);
        case 'bulk':
            return handleTaskBulkAction(newState, action as ITaskBulkAction);
        case 'due':
            return handleDueFilterAction(newState, action as IDueFilterAction);
        case 'config':
            return handleConfigAction(newState, action as IConfigChangeAction);
    }
    return newState;
}

function extractContexts(tasks: Task[]): string[] {
    return sortAndUniqueString(
        tasks.filter(task => !task.done).flatMap(task => task.contexts || [])
    );
}

function extractProjects(tasks: Task[]): string[] {
    return sortAndUniqueString(
        tasks.filter(task => !task.done).flatMap(task => task.projects || [])
    );
}

function extractTags(tasks: Task[]): string[] {
    return sortAndUniqueString(
        tasks.filter(task => !task.done).flatMap(task => task.tags || [])
    );
}

export function handleConfigAction(
    newState: IGlobalState,
    action: IConfigChangeAction
): IGlobalState {
    newState.config = {
        ...newState.config,
        [action.setting]: action.value
    };
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
