import { ServerSync } from '../src/storage/ServerSync';
import { GlobalWithFetchMock } from 'jest-fetch-mock';
import { ILocalStorage } from '../src/storage/LocalStorage';
import { Task } from 'brain-common';
import { sleep } from './util';
import { FrontendTask } from '../src/storage/FrontendTask';
import nanoid = require('nanoid');

class MockAbortController implements AbortController {
    signal: AbortSignal;

    abort(): void {}
}

const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock;
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;
customGlobal.AbortController = MockAbortController;

describe('Synchronization from remote server', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('atttempt to retrieve all tasks after startup', async () => {
        const remoteTask = {
            id: nanoid(),
            title: 'RemoteTask'
        };

        const getMock = fetchMock.mockResponseOnce(
            JSON.stringify([remoteTask])
        );
        const storage = {
            loadTasks: jest.fn(() => Promise.resolve([] as Task[])),
            markSync: jest.fn(() => Promise.resolve())
        };
        const sync = new ServerSync(storage);
        await sleep(15);
        expect(fetchMock.mock.calls.length).toStrictEqual(1);
        expect(fetchMock.mock.calls).toEqual([['/api/tasks']]);
        expect(storage.loadTasks.mock.calls.length).toStrictEqual(1);
    });
});

describe('Synchronization to remote server', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('atttempt to upload all locally updated tasks after startup', async () => {
        const localTasks: FrontendTask[] = [
            {
                id: nanoid(),
                title: 'New',
                hash: 'abcdef',
                owner: 'me',
                sync: false
            },
            {
                id: nanoid(),
                title: 'Updated',
                hash: 'sadae',
                owner: 'me',
                sync: false
            },
            {
                id: nanoid(),
                title: 'Unchanged',
                hash: '',
                owner: 'me',
                sync: true
            }
        ];

        const getMock = fetchMock.mockResponseOnce(JSON.stringify([]));
        const storage = {
            loadTasks: jest.fn(() => Promise.resolve(localTasks as Task[])),
            markSync: jest.fn(() => Promise.resolve())
        };
        const sync = new ServerSync(storage);
        await sleep(15);
        expect(fetchMock.mock.calls.length).toStrictEqual(2);
        const transferredTasks = localTasks.map(lt => {
            const { sync, ...task } = lt;
            return task;
        });
        expect(fetchMock.mock.calls).toEqual([
            [
                `/api/tasks/${localTasks[0].id}`,
                { method: 'PUT', body: JSON.stringify(transferredTasks[0]) }
            ],
            [
                `/api/tasks/${localTasks[1].id}`,
                { method: 'PUT', body: JSON.stringify(transferredTasks[1]) }
            ]
        ]);
        expect(storage.loadTasks.mock.calls.length).toStrictEqual(1);
    });

    it('atttempts to upload all locally updated tasks after startup', async () => {
        const localTasks: FrontendTask[] = [
            {
                id: nanoid(),
                title: 'New',
                hash: 'abcdef',
                owner: 'me',
                sync: false
            }
        ];

        const getMock = fetchMock.mockResponseOnce(JSON.stringify([]));
        const storage = {
            loadTasks: jest.fn(() => Promise.resolve(localTasks as Task[])),
            markSync: jest.fn((task: Task) => {
                localTasks.find(t => t.id === task.id).sync = true;
                return Promise.resolve();
            })
        };
        const serverSync = new ServerSync(storage);
        await sleep(15);
        console.log(fetchMock.mock.calls);
        expect(fetchMock.mock.calls.length).toStrictEqual(1);
        const { sync, ...reference } = localTasks[0];
        expect(fetchMock.mock.calls).toEqual([
            [
                `/api/tasks/${localTasks[0].id}`,
                { method: 'PUT', body: JSON.stringify(reference) }
            ]
        ]);
        expect(storage.loadTasks.mock.calls.length).toStrictEqual(1);
        expect(storage.markSync.mock.calls.length).toStrictEqual(1);
    });

    it('retries failed uploads', async () => {
        const localTasks: FrontendTask[] = [
            {
                id: nanoid(),
                title: 'New',
                hash: 'abcdef',
                owner: 'me',
                sync: false
            }
        ];

        const getMock = fetchMock.mockReject();
        const storage = {
            loadTasks: jest.fn(() => Promise.resolve(localTasks as Task[])),
            markSync: jest.fn((task: Task) => {
                localTasks.find(t => t.id === task.id).sync = true;
                return Promise.resolve();
            })
        };
        const serverSync = new ServerSync(storage, {
            retryInterval: 10,
            syncInterval: 2000
        });
        await sleep(15);
        console.log(fetchMock.mock.calls);
        expect(fetchMock.mock.calls.length).toStrictEqual(2);
        const { sync, ...reference } = localTasks[0];
        expect(fetchMock.mock.calls).toEqual([
            [
                `/api/tasks/${localTasks[0].id}`,
                { method: 'PUT', body: JSON.stringify(reference) }
            ],
            [
                `/api/tasks/${localTasks[0].id}`,
                { method: 'PUT', body: JSON.stringify(reference) }
            ]
        ]);
        expect(storage.loadTasks.mock.calls.length).toStrictEqual(2);
        expect(storage.markSync.mock.calls.length).toStrictEqual(0);
    });
});
