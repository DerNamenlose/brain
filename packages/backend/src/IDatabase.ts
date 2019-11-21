import { Task } from 'brain-common';

/**
 * Interface implemented by all databases
 */
export interface IDatabase {
    getAllTasks(): Promise<Task[]>;
}
