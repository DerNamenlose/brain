import { Task } from 'brain-common';
import { IDatabaseResult } from './DatabaseError';

/**
 * Interface implemented by all databases
 */
export interface IDatabase {
    /**
     * Get all tasks currently stored in the database
     */
    getAllTasks(): Promise<Task[]>;
    /**
     * Get a specific task by its id.
     * @param id The id of the task to look up
     */
    getById(id: string): Promise<IDatabaseResult<Task>>;

    /**
     * Store a specific task in the database
     *
     * @param task The new state of the task in question
     */
    saveTask(task: Task): Promise<IDatabaseResult<Task>>;
}
