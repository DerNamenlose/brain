import {
    handleEvent,
    SyncState,
    SyncEvent
} from '../src/storage/TaskStateMachine';
import { FrontendTask } from '../src/storage/FrontendTask';
import nanoid = require('nanoid');

describe('Frontend task state machine', () => {
    it('is in state Changed after being created', () => {
        const task: FrontendTask = {
            id: nanoid(),
            title: 'Test',
            syncState: 'Start',
            owner: 'me'
        };
        const changed = handleEvent(task, 'Create');
        expect(changed.syncState).toBe('Changed');
    });

    it('is in state Sync after being received from remote', () => {
        const task: FrontendTask = {
            id: nanoid(),
            title: 'Test',
            syncState: 'Start',
            owner: 'me'
        };
        const changed = handleEvent(task, 'RemoteUpdate');
        expect(changed.syncState).toBe('Sync');
    });

    it('is in state Changed after being updated locally', () => {
        const task: FrontendTask = {
            id: nanoid(),
            title: 'Test',
            syncState: 'Sync',
            owner: 'me'
        };
        const changed = handleEvent(task, 'Update');
        expect(changed.syncState).toBe('Changed');
    });

    it('is marked as conflicted if a remote update is received on a changed task', () => {
        const task: FrontendTask = {
            id: nanoid(),
            title: 'Test',
            syncState: 'Changed',
            owner: 'me'
        };
        const changed = handleEvent(task, 'RemoteUpdate');
        expect(changed.syncState).toBe('Conflict');
    });
});
