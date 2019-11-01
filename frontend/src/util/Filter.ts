import { Task } from '../model/Task';

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

export function applyFilter(
    tasks: Task[],
    selectedContexts: string[],
    selectedProjects: string[],
    selectedTags: string[]
): Task[] {
    return tasks.filter(
        task =>
            matches(selectedContexts, task.contexts) &&
            matches(selectedProjects, task.projects) &&
            matches(selectedTags, task.tags)
    );
}
