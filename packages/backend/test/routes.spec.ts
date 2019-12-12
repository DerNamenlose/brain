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

    // it('should return a conflict when an update is based on an outdated version', async () => {
    //     const db = {
    //         handleEvents(id: string, events: TaskEvent[]) {
    //             return Promise.resolve(
    //                 new DatabaseError(DatabaseErrorType.Conflict)
    //             );
    //         }
    //     };
    //     const app = new App(config, db);
    //     const response = await request(app.ExpressApp)
    //         .put('/api/task/invalid_task')
    //         .send({
    //             id: 'invalid_task',
    //             title: 'Test title',
    //             hash: 'some random old hash'
    //         });
    //     expect(response.status).to.equal(409);
    // });

    // it('should accept subsequent updates based on the latest version', async () => {
    //     const app = new App(config, db);
    //     const firstUpdate = await request(app.ExpressApp)
    //         .put('/api/task/task2')
    //         .send({
    //             ...tasks[1],
    //             title: 'New title'
    //         });
    //     expect(firstUpdate.status).to.equal(200);
    //     const newState = firstUpdate.body as Task;
    //     newState.title = 'And another update';
    //     const secondUpdate = await request(app.ExpressApp)
    //         .put('/api/task/task2')
    //         .send(newState);
    //     expect(secondUpdate.status).to.equal(200);
    // });

    // it('should return the existing version on conflict', async () => {
    //     const app = new App(config, db);
    //     const response = await request(app.ExpressApp)
    //         .put('/api/task/task2')
    //         .send({
    //             id: 'task2',
    //             title: 'Test title',
    //             hash: 'wrong hash'
    //         });
    //     expect(response.status).to.equal(409);
    //     const existing = response.body as Task;
    //     expect(existing).to.eql(tasks[1]);
    // });

    // it('should store a new task and retrieve it later', async () => {
    //     const app = new App(config, db);
    //     const task: Task = {
    //         id: 'newtask',
    //         title: 'Test title',
    //         owner: ''
    //     };
    //     const response = await request(app.ExpressApp)
    //         .put('/api/task/newtask')
    //         .send(task);
    //     expect(response.status).to.equal(200);
    //     const getResponse = await request(app.ExpressApp).get(
    //         '/api/task/newtask'
    //     );
    //     expect(getResponse.status).to.equal(200);
    //     const retrieved: Task = getResponse.body;
    //     expect(retrieved).to.eql(task);
    // });

    // it('should store an updated task and retrieve it later', async () => {
    //     const app = new App(config, db);
    //     const task: Task = {
    //         ...tasks[0],
    //         title: 'Changed title'
    //     };
    //     const response = await request(app.ExpressApp)
    //         .put('/api/task/task1')
    //         .send(task);
    //     expect(response.status).to.equal(200);
    //     const getResponse = await request(app.ExpressApp).get(
    //         '/api/task/task1'
    //     );
    //     expect(getResponse.status).to.equal(200);
    //     const retrieved: Task = getResponse.body;
    //     expect(retrieved).to.eql(task);
    // });
});
