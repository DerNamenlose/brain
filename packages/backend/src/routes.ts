import { IConfig } from 'config';
import * as express from 'express';
import { Task } from 'brain-common';
import { IDatabase } from './interfaces/IDatabase';
import { DatabaseError, DatabaseErrorType } from './interfaces/DatabaseError';

export class Routes {
    private _tasks = [] as Task[];
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
        const task = await this._database.getById(req.params['id']);
        if (!!task) {
            res.status(200).send(task);
        } else {
            res.status(404).send();
        }
    }

    private async saveTask(req: express.Request, res: express.Response) {
        const newTask = { ...req.body, id: req.params['id'] } as Task;
        if (!Routes.isValid(newTask)) {
            res.status(400).send({ message: 'Missing required field' });
        } else {
            const storedTask = await this._database.getById(req.params['id']);
            if (!Routes.isValidNextVersion(storedTask, newTask)) {
                res.status(409).send();
            }
            const storageResult = await this._database.createTask(newTask);
            const error = storageResult as DatabaseError;
            if (error) {
                res.status(500).send();
            } else {
                res.status(204).send();
            }
        }
    }

    private static isValid(task: Task): boolean {
        return !!task.title && !!task.version && !!task.hash;
    }

    private static isValidNextVersion(stored: Task, candidate: Task): boolean {
        return (
            (!stored && candidate.version === 1) ||
            (stored && candidate.version - stored.version === 1)
        );
    }
}
