import { App } from '../src/app';
import * as config from 'config';
import * as request from 'supertest';
import { IDatabase } from '../src/IDatabase';
import { expect } from 'chai';
import { Task } from 'brain-common';

describe('service root', () => {
    it('contains the correct links', async () => {
        const app = new App(config, undefined);
        const response = await request(app.ExpressApp).get('/api');
        expect(response.status).to.equal(200);
        expect(response.body).to.eql({
            links: {
                tasks: '/api/task',
                task: '/api/task/{id}'
            }
        });
    });
});

describe('tasks api', () => {
    const db = {
        async getAllTasks() {
            return [
                {
                    id: 'task1',
                    title: 'Just a task'
                } as Task,
                {
                    id: 'task2',
                    title: 'and another',
                    start: new Date(2019, 10, 12).getTime(),
                    version: 1,
                    hash: 'example'
                } as Task
            ];
        }
    };
    it('should list all available tasks', async () => {
        const app = new App(config, db);
        const response = await request(app.ExpressApp).get('/api/task');
        expect(response.body).to.eql(await db.getAllTasks());
    });
});
