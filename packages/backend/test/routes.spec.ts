import { App } from '../src/app';
import * as config from 'config';
import * as request from 'supertest';
import {
    DatabaseError,
    DatabaseErrorType
} from '../src/interfaces/DatabaseError';
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
    let tasks = [
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
    const db = {
        async getAllTasks() {
            return tasks;
        },
        async getById(id: string) {
            return tasks.find(t => t.id === id);
        },
        async createTask(task: Task) {
            if (tasks.find(t => t.id === task.id)) {
                return new DatabaseError(DatabaseErrorType.Conflict);
            }
        }
    };
    it('should list all available tasks', async () => {
        const app = new App(config, db);
        const response = await request(app.ExpressApp).get('/api/task');
        expect(response.body).to.eql(tasks);
    });

    it('should be able to retrieve an individual task by id', async () => {
        const app = new App(config, db);
        const response = await request(app.ExpressApp).get('/api/task/task1');
        expect(response.body).to.eql(tasks[0]);
    });

    it('should return 404 for non-existent tasks', async () => {
        const app = new App(config, db);
        const response = await request(app.ExpressApp).get('/api/task/invalid');
        expect(response.status).to.equal(404);
    });

    it('should return a conflict when trying to create existing tasks again', async () => {
        const app = new App(config, db);
        const response = await request(app.ExpressApp)
            .put('/api/task/task1')
            .send({
                id: 'task1'
            });
        expect(response.status).to.equal(409);
    });
});
