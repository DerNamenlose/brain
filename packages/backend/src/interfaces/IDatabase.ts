import { Task } from 'brain-common';

/**
 * Interface implemented by all databases
 */
export interface IDatabase {
    getAllTasks(): Promise<Task[]>;
    /**
     * Get a specific task by its id.
     * @param id The id of the task to look up
     */
    getById(id: string): Promise<Task | undefined>;

    createTask(task: Task): Promise<Task | IDatabaseError>;
}
