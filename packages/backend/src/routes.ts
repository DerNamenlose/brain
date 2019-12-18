import { IConfig } from 'config';
import * as express from 'express';
import { Task } from 'brain-common';
import { IDatabase } from './interfaces/IDatabase';
import { DatabaseObject } from './interfaces/DatabaseError';

interface ValidationErrorMessage {
    message: string;
    eventId?: string;
}

interface ValidationResult {
    success: boolean;
    errors: ValidationErrorMessage[];
}

export class Routes {
    private _config: IConfig;
    private _database: IDatabase;

    public constructor(
        config: IConfig,
        app: express.Application,
        database: IDatabase
    ) {
        this._config = config;
        this._database = database;

        app.route('/api').get(this.serviceRoot.bind(this));
        app.route('/api/task').get(this.getTasks.bind(this));
        app.route('/api/task/:id')
            .get(this.getTask.bind(this))
            .put(this.updateTasks.bind(this));
    }

    private serviceRoot(req: express.Request, res: express.Response) {
        res.status(200).send({
            links: {
                tasks: '/api/task',
                task: '/api/task/{id}'
            }
        });
    }

    private async getTasks(req: express.Request, res: express.Response) {
        res.status(200).send(await this._database.getAllTasks());
    }

    private async getTask(req: express.Request, res: express.Response) {
        const result = await this._database.getById(req.params['id']);
        if (!result.isError) {
            res.status(200).send((result as DatabaseObject<Task>).value);
        } else {
            res.status(404).send();
        }
    }

    private async updateTasks(req: express.Request, res: express.Response) {
        const task = req.body as Task;
        console.log('Task', task);
        const validationResult = Routes.isValid(task);
        console.log('Validation', validationResult);
        if (!validationResult.success) {
            res.status(400).send(validationResult.errors);
            return;
        }
        const result = await this._database.saveTask(task);
        if (result.isError) {
            res.status(409);
        } else {
            res.status(200);
        }
        res.send(result.value);
    }

    private static isValid(task: Task): ValidationResult {
        let result: ValidationResult = {
            success: true,
            errors: []
        };
        if (!task.id) {
            result.success = false;
            result.errors.push({ message: 'Tasks need an id' });
        }
        if (!task.title) {
            result.success = false;
            result.errors.push({ message: 'Tasks need a title' });
        }
        if (!task.owner) {
            result.success = false;
            result.errors.push({ message: 'Tasks need an owner' });
        }
        return result;
    }
}
