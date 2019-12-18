import { App } from '../src/app';
import * as config from 'config';
import * as request from 'supertest';
import {
    DatabaseError,
    DatabaseErrorType,
    DatabaseObject
} from '../src/interfaces/DatabaseError';
import { Task } from 'brain-common';
import { IDatabase } from '../src/interfaces/IDatabase';

describe('service root', () => {
    it('contains the correct links', async () => {
        const app = new App(config, undefined);
        const response = await request(app.ExpressApp).get('/api');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
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

    it('should list all available tasks', async () => {
        const db = ({
            getAllTasks() {
                return Promise.resolve(tasks);
            }
        } as unknown) as IDatabase;
        const app = new App(config, db);
        const response = await request(app.ExpressApp).get('/api/task');
        expect(response.body).toEqual(tasks);
    });

    it('should be able to retrieve an individual task by id', async () => {
        const db = {
            call: 0,
            getById(id: string) {
                expect(id).toEqual('task1');
                this.call++;
                return Promise.resolve(new DatabaseObject(tasks[0]));
            }
        };
        const app = new App(config, (db as unknown) as IDatabase);
        const response = await request(app.ExpressApp).get('/api/task/task1');
        expect(db.call).toBe(1);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(tasks[0]);
    });

    it('should return 404 for non-existent tasks', async () => {
        const db = {
            getById(id: string) {
                return Promise.resolve(
                    new DatabaseError(DatabaseErrorType.NotFound)
                );
            }
        };
        const app = new App(config, (db as unknown) as IDatabase);
        const response = await request(app.ExpressApp).get('/api/task/invalid');
        expect(response.status).toEqual(404);
    });

    it('should return the existing element on conflict', async () => {
        const existing = {
            id: 'task1',
            title: 'existing',
            owner: 'me',
            description: 'Something',
            hash: 'existing-hash'
        };
        const db = {
            saveTask(task: Task) {
                return Promise.resolve(
                    new DatabaseError(DatabaseErrorType.Conflict, existing)
                );
            }
        };
        const app = new App(config, (db as unknown) as IDatabase);
        const response = await request(app.ExpressApp)
            .put('/api/task/task1')
            .send({
                id: 'task1',
                title: 'New title',
                owner: 'me'
            });
        expect(response.status).toEqual(409);
        expect(response.body).toMatchObject(existing);
    });

    it('should return the new version hash on write', async () => {
        const db = {
            saveTask(task: Task) {
                return Promise.resolve(
                    new DatabaseObject({ ...task, hash: 'newHash' })
                );
            }
        };
        const app = new App(config, (db as unknown) as IDatabase);
        const response = await request(app.ExpressApp)
            .put('/api/task/task1')
            .send({
                id: 'task1',
                title: 'New title',
                owner: 'me'
            });
        expect(response.status).toEqual(200);
        expect(response.body).toMatchObject({
            id: 'task1',
            title: 'New title',
            owner: 'me',
            hash: 'newHash'
        });
    });
});
