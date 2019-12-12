import { CouchDB, DesignDoc, TaskDbo } from '../src/couchdb';
import * as nano from 'nano';
import {
    DatabaseObject,
    DatabaseError,
    DatabaseErrorType
} from '../src/interfaces/DatabaseError';
import { Task } from 'brain-common';
import * as dotenv from 'dotenv';

dotenv.config();
const serverUrl = process.env.TESTHOST || 'http://localhost:5984';

describe('CouchDB backend', () => {
    let dbName: string = '';
    let db: CouchDB = undefined;
    let directServer: nano.ServerScope;

    beforeEach(async () => {
        dbName = `test-${Math.floor(Math.random() * 1_000_000)}`;
        directServer = nano(serverUrl);
        await directServer.db.create(dbName);
        db = new CouchDB(serverUrl, dbName);
        await db.checkAndUpdate();
    });

    afterEach(async () => {
        await directServer.db.destroy(dbName);
    });

    it('should create the necessary design documents', async () => {
        const directDb = directServer.db.use(dbName);
        const designDoc = await directDb.get('_design/tasks');
        expect(designDoc).toMatchObject(DesignDoc);
    });

    it('should retrieve all tasks', async () => {
        const tasks = [
            {
                id: '1234567890',
                title: 'Test1',
                description: 'Something',
                owner: 'owner',
                type: 'task'
            },
            {
                id: '9876543210',
                title: 'Test2',
                contexts: ['c1', 'c2'],
                owner: 'owner',
                type: 'task'
            }
        ];
        const directDb = directServer.db.use(dbName);
        await directDb.bulk({
            docs: tasks.map(t => {
                const { id, ...dbo } = t;
                return { _id: `t${t.id}`, ...dbo };
            })
        });
        const retrieved = await db.getAllTasks();
        expect(retrieved).toMatchObject(tasks);
    });

    it('should retrieve individual tasks', async () => {
        const task = {
            id: '1234567890',
            title: 'Test1',
            description: 'Something',
            owner: 'owner',
            type: 'task'
        };
        const directDb = directServer.db.use(dbName);
        const { id, ...dbo } = task;
        await directDb.insert({ _id: `t${task.id}`, ...dbo });
        const retrieved = await db.getById('1234567890');
        expect(retrieved.isError).toBeFalsy();
        const dbObject = retrieved as DatabaseObject<Task>;
        expect(dbObject.value).toMatchObject(task);
    });

    it('should indicate not found tasks', async () => {
        const retrieved = await db.getById('1234567890');
        expect(retrieved.isError).toBeTruthy();
        expect((retrieved as DatabaseError<Task>).type).toBe(
            DatabaseErrorType.NotFound
        );
    });

    it('create tasks correctly', async () => {
        const task: Task = {
            id: '123456',
            title: 'Test1',
            description: 'Something',
            owner: 'owner'
        };
        await db.saveTask(task);
        const directDb = directServer.db.use(dbName);
        const dbResult = await directDb.get(`t123456`);
        expect(dbResult).toEqual({
            _id: 't123456',
            title: 'Test1',
            description: 'Something',
            owner: 'owner',
            type: 'task',
            _rev: expect.any(String)
        });
    });

    it('should overwrite tasks correctly', async () => {
        const original = {
            _id: 't1234567890',
            title: 'Test1',
            description: 'Something',
            owner: 'owner',
            type: 'task'
        };
        const directDb = directServer.db.use(dbName);
        const createResult = await directDb.insert(original);
        const task = {
            id: '1234567890',
            title: 'Test1 new',
            hash: createResult.rev,
            description: 'Something new',
            owner: 'owner',
            type: 'task'
        };
        const result = await db.saveTask(task);
        expect(result.isError).toBeFalsy();
        const retrieved = await db.getById('1234567890');
        expect(retrieved.isError).toBeFalsy();
        const matcher = { ...task, hash: expect.any(String) };
        expect(retrieved.value).toMatchObject(matcher);
    });

    it('should update the version hash on write', async () => {
        const original = {
            _id: 't1234567890',
            title: 'Test1',
            description: 'Something',
            owner: 'owner',
            type: 'task'
        };
        const directDb = directServer.db.use(dbName);
        await directDb.insert(original);
        const taskResult = await db.getById('1234567890');
        expect(taskResult.isError).toBeFalsy();
        expect(
            (taskResult as DatabaseObject<Task>).value.hash
        ).not.toBeUndefined();
    });

    it('should refuse to overwrite newer object versions', async () => {
        const task = {
            id: '1234567890',
            title: 'Test1 new',
            description: 'Something new',
            owner: 'owner',
            type: 'task'
        };
        let result = await db.saveTask(task);
        expect(result.isError).toBeFalsy();
        const retrieved = await db.getById('1234567890');
        expect(retrieved.isError).toBeFalsy();
        const update = {
            ...retrieved.value,
            title: 'Updated'
        };
        result = await db.saveTask(update);
        expect(result.isError).toBeFalsy();
        // try to write a conflicting update
        const conflict = {
            ...retrieved.value,
            title: 'Conflict'
        };
        result = await db.saveTask(conflict);
        expect(result.isError).toBeTruthy();
        const error = result as DatabaseError<Task>;
        expect(error.type).toEqual(DatabaseErrorType.Conflict);
    });

    it('should implement idempotent object updates', async () => {
        const task = {
            id: '1234567890',
            title: 'Test1 new',
            description: 'Something new',
            owner: 'owner',
            type: 'task'
        };
        let result = await db.saveTask(task);
        expect(result.isError).toBeFalsy();
        const retrieved = await db.getById('1234567890');
        expect(retrieved.isError).toBeFalsy();
        const update = {
            ...retrieved.value,
            title: 'Updated'
        };
        result = await db.saveTask(update);
        expect(result.isError).toBeFalsy();
        // try to write the update a second time (e.g. if the response to the update got lost)
        result = await db.saveTask(update);
        expect(result.isError).toBeFalsy();
    });
});
