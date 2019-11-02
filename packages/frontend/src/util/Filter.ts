import { Task } from 'brain-common';

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

export function overviewFilter(
    tasks: Task[],
    selectedContexts: string[],
    selectedProjects: string[],
    selectedTags: string[]
): Task[] {
    return tasks.filter(
        task =>
            !task.postponed && // postponed tasks are by definition not visible
            !!task.contexts && // only tasks that have a context are in the overview.
            task.contexts.length > 0 && // Tasks without any contexts are in the inbox by definition
            matches(selectedContexts, task.contexts) &&
            matches(selectedProjects, task.projects) &&
            matches(selectedTags, task.tags)
    );
}

export function inboxFilter(tasks: Task[]): Task[] {
    return tasks.filter(
        task =>
            !task.postponed && (!task.contexts || task.contexts.length === 0)
    ); // The inbox contains (by definition) tasks not yet assigned to any context
}

export function somedayMaybeFilter(tasks: Task[]): Task[] {
    return tasks.filter(task => !!task.postponed); // Someday/Maybe is a specific flag on the task
}
