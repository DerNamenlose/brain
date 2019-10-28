import { Task } from '../model/Task';

export function applyFilter(tasks: Task[], selectedContexts: string[]) {
    if (selectedContexts.length === 0) {
        return tasks;
    }
    return tasks.filter(task => {
        return (
            task.contexts &&
            task.contexts.reduce(
                (found: boolean, ctx: string) =>
                    found || !!selectedContexts.find(sctx => sctx === ctx),
                false
            )
        );
    });
}
