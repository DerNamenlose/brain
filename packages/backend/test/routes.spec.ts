import { App } from '../src/app';
import * as config from 'config';
import * as request from 'supertest';
import {
    DatabaseError,
    DatabaseErrorType,
    DatabaseObject
} from '../src/interfaces/DatabaseError';
import { expect } from 'chai';
import { Task, calculateVersionHash } from 'brain-common';

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
            title: 'Just a task',
            version: 2
        } as Task,
        {
            id: 'task2',
            title: 'and another',
            start: new Date(2019, 10, 12).getTime(),
            version: 1
        } as Task
    ];
    tasks[0].hash = calculateVersionHash(tasks[0]);
    tasks[1].hash = calculateVersionHash(tasks[1]);
    const db = {
        async getAllTasks() {
            return tasks;
        },
        async getById(id: string) {
            const task = tasks.find(t => t.id === id);
            if (!task) {
                return new DatabaseError(DatabaseErrorType.NotFound);
            }
            return new DatabaseObject(task);
        },
        async saveTask(task: Task) {
            const existing = tasks.findIndex(t => t.id === task.id);
            if (existing === -1) {
                tasks.push(task);
            } else {
                tasks.splice(existing, 1, task);
            }
            return new DatabaseObject(tasks[existing]);
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
                id: 'task1',
                title: 'New title',
                version: 1,
                hash: 'Some hash'
            });
        expect(response.status).to.equal(409);
    });

    it('should refuse tasks without versions', async () => {
        const app = new App(config, db);
        const response = await request(app.ExpressApp)
            .put('/api/task/invalid_task')
            .send({
                id: 'invalid_task',
                title: 'Test title'
            });
        expect(response.status).to.equal(400);
    });

    it('should refuse tasks with an older version, than stored', async () => {
        const app = new App(config, db);
        const response = await request(app.ExpressApp)
            .put('/api/task/task2')
            .send({
                id: 'task2',
                title: 'Test title',
                version: 1,
                hash: 'new hash'
            });
        expect(response.status).to.equal(409);
    });

    it('should silently acknowledge writes with the same version and hash', async () => {
        const app = new App(config, db);
        const response = await request(app.ExpressApp)
            .put('/api/task/task2')
            .send(tasks[1]);
        expect(response.status).to.equal(204);
    });

    it('should refuse tasks with the same version, but a different hash', async () => {
        const app = new App(config, db);
        const newTask = { ...tasks[1], title: 'Some new title' };
        const response = await request(app.ExpressApp)
            .put('/api/task/task2')
            .send(newTask);
        expect(response.status).to.equal(409);
    });

    it('should return the existing version on conflict', async () => {
        const app = new App(config, db);
        const response = await request(app.ExpressApp)
            .put('/api/task/task2')
            .send({
                id: 'task2',
                title: 'Test title',
                version: 1,
                hash: 'new hash'
            });
        expect(response.status).to.equal(409);
        const existing = response.body as Task;
        expect(existing).to.eql(tasks[1]);
    });

    it('should store a new task and retrieve it later', async () => {
        const app = new App(config, db);
        const task: Task = {
            id: 'newtask',
            title: 'Test title',
            version: 1,
            hash: ''
        };
        task.hash = calculateVersionHash(task);
        const response = await request(app.ExpressApp)
            .put('/api/task/newtask')
            .send(task);
        expect(response.status).to.equal(204);
        const getResponse = await request(app.ExpressApp).get(
            '/api/task/newtask'
        );
        expect(getResponse.status).to.equal(200);
        const retrieved: Task = getResponse.body;
        expect(retrieved).to.eql(task);
    });

    it('should store an updated task and retrieve it later', async () => {
        const app = new App(config, db);
        const task: Task = {
            ...tasks[0],
            title: 'Changed title',
            version: tasks[0].version + 1
        };
        task.hash = calculateVersionHash(task);
        const response = await request(app.ExpressApp)
            .put('/api/task/task1')
            .send(task);
        expect(response.status).to.equal(204);
        const getResponse = await request(app.ExpressApp).get(
            '/api/task/task1'
        );
        expect(getResponse.status).to.equal(200);
        const retrieved: Task = getResponse.body;
        expect(retrieved).to.eql(task);
    });
});
