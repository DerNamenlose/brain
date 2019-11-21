import { IConfig } from 'config';
import * as express from 'express';
import { Task } from 'brain-common';

export class Routes {
    private _tasks = [] as Task[];
    private _config: IConfig;

    public constructor(config: IConfig, app: express.Application) {
        this._config = config;

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

    private getTasks(req: express.Request, res: express.Response) {
        res.status(200).send(this._tasks);
    }

    private getTask(req: express.Request, res: express.Response) {
        res.status(200).send('Hi');
    }

    private saveTask(req: express.Request, res: express.Response) {
        const taskIndex = this._tasks.findIndex(
            task => req.params['id'] === task.id
        );
        const storedObject = { ...req.body, id: req.params['id'] };
        if (taskIndex === -1) {
            this._tasks.push(storedObject);
        } else {
            this._tasks = this._tasks.splice(taskIndex, 1, storedObject);
        }
        res.status(204).send();
    }
}
