import { CouchDB, DesignDoc, TaskDbo } from '../src/couchdb';
import * as nano from 'nano';
import { expect } from 'chai';
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
                type: 'task',
                version: 1,
                hash: 'dfdsafgsdfgs'
            },
            {
                id: '9876543210',
                title: 'Test2',
                contexts: ['c1', 'c2'],
                owner: 'owner',
                type: 'task',
                version: 1,
                hash: 'adsafsdfaasd'
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
});
