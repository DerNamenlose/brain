import { Task } from 'brain-common';
import { differenceInDays } from 'date-fns/esm';
import { IGlobalConfig } from '../model/GlobalConfig';

function matches(filterProperties: string[], taskProperties?: string[]) {
    return (
        filterProperties.length === 0 ||
        (taskProperties &&
            taskProperties.reduce(
                (found: boolean, prop: string) =>
                    found || !!filterProperties.find(fprop => fprop === prop),
                false
            ))
    );
}

export function isDueIn(task: Task, today: Date, dueIn?: number): boolean {
    return (
        dueIn === undefined ||
        (!!task.due && differenceInDays(task.due, today) < dueIn)
    );
}

export function overviewFilter(config: IGlobalConfig, tasks: Task[]): Task[] {
    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    return tasks
        .filter(task => {
            return (
                !task.postponed && // postponed tasks are by definition not visible
                !!task.contexts && // only tasks that have a context are in the overview.
                task.contexts.length > 0 && // Tasks without any contexts are in the inbox by definition
                matches(config.selectedContexts, task.contexts) &&
                matches(config.selectedProjects, task.projects) &&
                matches(config.selectedTags, task.tags) &&
                matches(config.selectedDelegates, [
                    task.delegatedTo || '<me>'
                ]) &&
                isDueIn(task, today, config.dueIn)
            );
        })
        .filter(startFilter(config))
        .filter(doneFilter(config));
}

export function inboxFilter(config: IGlobalConfig, tasks: Task[]): Task[] {
    return tasks
        .filter(
            task =>
                !task.postponed &&
                (!task.contexts || task.contexts.length === 0)
        ) // The inbox contains (by definition) tasks not yet assigned to any context
        .filter(startFilter(config))
        .filter(doneFilter(config));
}

export function somedayMaybeFilter(
    config: IGlobalConfig,
    tasks: Task[]
): Task[] {
    return tasks.filter(task => !!task.postponed).filter(startFilter(config)); // Someday/Maybe is a specific flag on the task
}

function startFilter(config: IGlobalConfig): (task: Task) => boolean {
    return (task: Task) =>
        config.showFutureStart || !task.start || task.start <= Date.now();
}

function doneFilter(config: IGlobalConfig): (task: Task) => boolean {
    return (task: Task) => config.showDone || !task.done;
}
