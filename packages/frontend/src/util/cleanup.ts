import { LocalStorage } from '../storage/LocalStorage';
import addDays from 'date-fns/addDays';

export async function triggerCleanup(
    olderThanDays: number,
    storage: LocalStorage
) {
    console.log('Triggering expired task cleanup');
    const existingTasks = await storage.loadTasks();
    const cutOffTime = addDays(Date.now(), -olderThanDays).getTime();
    const oldTasksWithoutFinishDate = existingTasks.filter(
        task => !!task.done && !task.finishedOn
    );
    for (const task of oldTasksWithoutFinishDate) {
        task.finishedOn = Date.now();
        await storage.update(task);
    }
    const tasksToDelete = existingTasks.filter(
        task => !!task.done && !!task.finishedOn && task.finishedOn < cutOffTime
    );
    if (tasksToDelete.length !== 0) {
        console.log(`Cleaning up ${tasksToDelete.length} expired tasks.`);
    }
    for (const task of tasksToDelete) {
        await storage.deleteTask(task.id);
    }
}
