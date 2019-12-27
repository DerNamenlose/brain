import { ServerSync } from '../src/storage/ServerSync';
import { GlobalWithFetchMock } from 'jest-fetch-mock';
import { ILocalStorage } from '../src/storage/LocalStorage';
import { Task } from 'brain-common';
import { FrontendTask } from '../src/storage/FrontendTask';
import { sleep } from './util';
import nanoid = require('nanoid');

// jest.useFakeTimers();

class MockAbortController implements AbortController {
    signal: AbortSignal = undefined;

    abort(): void {
        this.signal?.dispatchEvent(new Event('abort'));
    }
}

const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock;
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;
customGlobal.AbortController = MockAbortController;

describe('Synchronization from remote server', () => {
    let sync: ServerSync = null;

    beforeEach(() => {
        fetchMock.resetMocks();
    });

    afterEach(() => {
        sync && sync.shutdown();
    });

    it('atttempts to retrieve all tasks after startup', async () => {
        const remoteTask = {
            id: nanoid(),
            title: 'RemoteTask'
        };

        fetchMock.mockResponse(JSON.stringify([remoteTask]));
        const storage = {
            loadTasks: jest.fn(() => Promise.resolve([] as Task[])),
            markSync: jest.fn(() => Promise.resolve()),
            storeTask: jest.fn((task: Task, isSync: boolean) =>
                Promise.resolve()
            ),
            addConflict: jest.fn((taskId: string, conflictingVersion: Task) =>
                Promise.resolve()
            )
        };
        sync = new ServerSync(storage);
        await sleep(15);
        expect(fetchMock).toBeCalledWith('/api/tasks', { signal: undefined });
        expect(storage.loadTasks).toBeCalledTimes(2);
    });

    it('injects retrieved tasks into the local storage', async () => {
        const remoteTask = {
            id: nanoid(),
            title: 'RemoteTask'
        };

        fetchMock.mockResponse(JSON.stringify([remoteTask]));
        const storage = {
            loadTasks: jest.fn(() => Promise.resolve([] as Task[])),
            markSync: jest.fn(() => Promise.resolve()),
            storeTask: jest.fn((task: Task, isSync: boolean) => {
                return Promise.resolve();
            }),
            addConflict: jest.fn((taskId: string, conflictingVersion: Task) =>
                Promise.resolve()
            )
        };
        sync = new ServerSync(storage);
        await sleep(15);
        expect(fetchMock).toBeCalledWith('/api/tasks', { signal: undefined });
        expect(storage.loadTasks).toBeCalledTimes(2);
        expect(storage.storeTask).toBeCalledTimes(1);
    });

    it('updates remotely updated tasks locally', async () => {
        const remoteTask = {
            id: nanoid(),
            title: 'RemoteTask',
            hash: 'newVersion'
        };

        fetchMock.mockResponse(JSON.stringify([remoteTask]));
        const storage = {
            loadTasks: jest.fn(() =>
                Promise.resolve([
                    {
                        id: remoteTask.id,
                        title: 'Old remote task',
                        hash: 'oldVersion',
                        sync: true
                    }
                ] as FrontendTask[])
            ),
            markSync: jest.fn(() => Promise.resolve()),
            storeTask: jest.fn((task: Task, isSync: boolean) => {
                return Promise.resolve();
            }),
            addConflict: jest.fn((taskId: string, conflictingVersion: Task) =>
                Promise.resolve()
            )
        };
        sync = new ServerSync(storage);
        await sleep(15);
        expect(storage.loadTasks).toBeCalledTimes(2);
        expect(storage.storeTask).toBeCalledTimes(1);
        expect(storage.storeTask).toBeCalledWith(
            {
                id: remoteTask.id,
                title: 'RemoteTask',
                hash: 'newVersion'
            },
            true
        );
    });

    it('attaches the server version to conflicted tasks', async () => {
        const remoteTask = {
            id: nanoid(),
            title: 'RemoteTask',
            hash: 'newVersion'
        };

        fetchMock.mockResponse(JSON.stringify([remoteTask]));
        const storage = {
            loadTasks: jest.fn(() =>
                Promise.resolve([
                    {
                        id: remoteTask.id,
                        title: 'updated local task',
                        hash: 'changedVersion',
                        sync: false
                    }
                ] as FrontendTask[])
            ),
            markSync: jest.fn(() => Promise.resolve()),
            storeTask: jest.fn((task: Task, isSync: boolean) => {
                return Promise.resolve();
            }),
            addConflict: jest.fn((taskId: string, conflictingVersion: Task) =>
                Promise.resolve()
            )
        };
        sync = new ServerSync(storage);
        await sleep(15);
        expect(storage.loadTasks).toBeCalledTimes(2);
        expect(storage.addConflict).toBeCalledTimes(1);
        expect(storage.addConflict).toBeCalledWith(remoteTask.id, {
            id: remoteTask.id,
            title: 'RemoteTask',
            hash: 'newVersion'
        });
    });
});

describe('Synchronization to remote server', () => {
    let serverSync: ServerSync = null;

    beforeEach(() => {
        fetchMock.resetMocks();
    });

    afterEach(() => {
        serverSync && serverSync.shutdown();
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

        fetchMock.mockResponse(JSON.stringify([]));
        const storage = {
            loadTasks: jest.fn(() => Promise.resolve(localTasks as Task[])),
            markSync: jest.fn(() => Promise.resolve()),
            storeTask: jest.fn((task: Task, isSync: boolean) =>
                Promise.resolve()
            ),
            addConflict: jest.fn((taskId: string, conflictingVersion: Task) =>
                Promise.resolve()
            )
        };
        serverSync = new ServerSync(storage);
        await sleep(15);
        expect(fetchMock).toHaveBeenCalledTimes(3);
        const transferredTasks = localTasks.map(lt => {
            const { sync, ...task } = lt;
            return task;
        });
        expect(fetchMock).toHaveBeenCalledWith('/api/tasks', {
            signal: undefined
        });
        expect(fetchMock).toHaveBeenCalledWith(
            `/api/tasks/${localTasks[0].id}`,
            {
                method: 'PUT',
                body: JSON.stringify(transferredTasks[0]),
                signal: undefined
            }
        );
        expect(fetchMock).toHaveBeenCalledWith(
            `/api/tasks/${localTasks[1].id}`,
            {
                method: 'PUT',
                body: JSON.stringify(transferredTasks[1]),
                signal: undefined
            }
        );
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

        fetchMock.mockResponse(JSON.stringify([]));
        const storage = {
            loadTasks: jest.fn(() => Promise.resolve(localTasks as Task[])),
            markSync: jest.fn((task: Task) => {
                localTasks.find(t => t.id === task.id).sync = true;
                return Promise.resolve();
            }),
            storeTask: jest.fn((task: Task, isSync: boolean) =>
                Promise.resolve()
            ),
            addConflict: jest.fn((taskId: string, conflictingVersion: Task) =>
                Promise.resolve()
            )
        };
        serverSync = new ServerSync(storage);
        await sleep(15);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        const { sync, ...reference } = localTasks[0];
        expect(fetchMock).toHaveBeenCalledWith('/api/tasks', {
            signal: undefined
        });
        expect(fetchMock).toHaveBeenCalledWith(
            `/api/tasks/${localTasks[0].id}`,
            { method: 'PUT', body: JSON.stringify(reference) }
        );
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

        fetchMock.mockRejectOnce().mockResponseOnce(JSON.stringify([]));
        const storage = {
            loadTasks: jest.fn(() => Promise.resolve(localTasks as Task[])),
            markSync: jest.fn((task: Task) => {
                localTasks.find(t => t.id === task.id).sync = true;
                return Promise.resolve();
            }),
            storeTask: jest.fn((task: Task, isSync: boolean) =>
                Promise.resolve()
            ),
            addConflict: jest.fn((taskId: string, conflictingVersion: Task) =>
                Promise.resolve()
            )
        };
        serverSync = new ServerSync(storage, {
            retryInterval: 10,
            syncInterval: 2000
        });
        await sleep(200);
        expect(fetchMock).toHaveBeenCalledTimes(3);
        const { sync, ...reference } = localTasks[0];
        expect(fetchMock).toHaveBeenCalledWith('/api/tasks', {
            signal: undefined
        });
        expect(fetchMock).toHaveBeenCalledWith(
            `/api/tasks/${localTasks[0].id}`,
            { method: 'PUT', body: JSON.stringify(reference) }
        );
        expect(fetchMock).toHaveBeenCalledWith(
            `/api/tasks/${localTasks[0].id}`,
            { method: 'PUT', body: JSON.stringify(reference) }
        );
        expect(storage.loadTasks).toHaveBeenCalledTimes(3);
        expect(storage.markSync).toHaveBeenCalledTimes(1);
    });
});
