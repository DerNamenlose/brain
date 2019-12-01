import { CouchDB, DesignDoc, TaskDbo } from '../src/couchdb';
import * as nano from 'nano';
import { expect } from 'chai';
import { DatabaseObject } from '../src/interfaces/DatabaseError';
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
        expect(designDoc).to.deep.include(DesignDoc);
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
        expect(retrieved).to.eql(tasks);
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
        expect(retrieved.isError).to.be.false;
        const dbObject = retrieved as DatabaseObject<Task>;
        expect(dbObject.value).to.eql(task);
    });

    it('should store tasks correctly', async () => {
        const task = {
            id: '1234567890',
            title: 'Test1',
            description: 'Something',
            owner: 'owner',
            type: 'task'
        };
        await db.saveTask(task);
        const directDb = directServer.db.use(dbName);
        const dbResult = await directDb.get(`t${task.id}`);
        const { _rev, ...dbo } = dbResult;
        expect(dbo as TaskDbo).to.eql({
            _id: 't1234567890',
            title: 'Test1',
            description: 'Something',
            owner: 'owner',
            type: 'task'
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
        await directDb.insert(original);
        const task = {
            id: '1234567890',
            title: 'Test1 new',
            description: 'Something new',
            owner: 'owner',
            type: 'task'
        };
        const result = await db.saveTask(task);
        expect(result.isError).to.be.false;
        const retrieved = await db.getById('1234567890');
        expect(retrieved.isError).to.be.false;
        expect((retrieved as DatabaseObject<Task>).value).to.eql(task);
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
        expect(taskResult.isError).to.be.false;
        expect((taskResult as DatabaseObject<Task>).value.hash).to.not.be
            .undefined;
    });
});
