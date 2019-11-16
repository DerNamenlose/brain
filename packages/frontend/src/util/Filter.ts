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

export function overviewFilter(
    config: IGlobalConfig,
    tasks: Task[],
    selectedContexts: string[],
    selectedProjects: string[],
    selectedTags: string[],
    dueIn?: number
): Task[] {
    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    return tasks.filter(task => {
        return (
            !task.postponed && // postponed tasks are by definition not visible
            !!task.contexts && // only tasks that have a context are in the overview.
            task.contexts.length > 0 && // Tasks without any contexts are in the inbox by definition
            (config.showDone || !task.done) && // show done tasks only when requested by the config
            (config.showFutureStart ||
                !task.start ||
                task.start <= Date.now()) && // show items depending on whether their start date has passed
            matches(selectedContexts, task.contexts) &&
            matches(selectedProjects, task.projects) &&
            matches(selectedTags, task.tags) &&
            isDueIn(task, today, dueIn)
        );
    });
}

export function inboxFilter(config: IGlobalConfig, tasks: Task[]): Task[] {
    return tasks.filter(task => {
        return (
            (config.showFutureStart ||
                !task.start ||
                task.start <= Date.now()) && // show items depending on whether their start date has passed
            (config.showDone || !task.done) &&
            !task.postponed &&
            (!task.contexts || task.contexts.length === 0)
        );
    }); // The inbox contains (by definition) tasks not yet assigned to any context
}

export function somedayMaybeFilter(tasks: Task[]): Task[] {
    return tasks.filter(task => !!task.postponed); // Someday/Maybe is a specific flag on the task
}
