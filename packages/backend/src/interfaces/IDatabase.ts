import { Task } from 'brain-common';
import { IDatabaseResult } from './DatabaseError';

/**
 * Interface implemented by all databases
 */
export interface IDatabase {
    getAllTasks(): Promise<Task[]>;
    /**
     * Get a specific task by its id.
     * @param id The id of the task to look up
     */
    getById(id: string): Promise<IDatabaseResult>;

    saveTask(task: Task): Promise<IDatabaseResult>;
}
