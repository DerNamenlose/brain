import { IConfig } from 'config';
import * as express from 'express';
import { Task, calculateVersionHash } from 'brain-common';
import { IDatabase } from './interfaces/IDatabase';
import { DatabaseObject } from './interfaces/DatabaseError';

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
            .put(this.saveTask.bind(this));
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

    private async saveTask(req: express.Request, res: express.Response) {
        const update = {
            ...req.body,
            id: req.params['id']
        } as Task;
        if (!Routes.isValid(update)) {
            res.status(400).send({ message: 'Missing required field' });
            return;
        }
        const result = await this._database.getById(req.params['id']);
        const storedObject: Task = result.isError
            ? undefined
            : (result as DatabaseObject<Task>).value;

        if (storedObject?.hash === update.hash) {
            const storageResult = await this._database.saveTask(update);
            if (storageResult.isError) {
                res.status(500).send();
                return;
            }
            res.status(200).send((storageResult as DatabaseObject<Task>).value);
        }
        res.status(409).send(storedObject);
    }

    private static isValid(task: Task): boolean {
        return !!task.title;
    }
}
