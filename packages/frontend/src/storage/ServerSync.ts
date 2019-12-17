import { ILocalStorage } from './LocalStorage';
import { Task } from 'brain-common';

export interface SyncConfig {
    /**
     * The maximum interval in which to attempt a sync (in ms)
     */
    syncInterval: number;
    /**
     * The retry interval for failed uploads
     */
    retryInterval: number;
}

export class ServerSync {
    private _storage: ILocalStorage;
    private _config: SyncConfig;

    constructor(
        storage: ILocalStorage,
        config: SyncConfig = { syncInterval: 5000, retryInterval: 5000 }
    ) {
        this._storage = storage;
        this._config = config;
        console.log(
            `Starting synchonization with an interval of ${config.syncInterval} ms`
        );
        setTimeout(this.syncToRemote.bind(this), 0);
    }

    async syncToRemote() {
        const ctrl = new AbortController();
        const tasks = await this._storage.loadTasks();
        const tasksToSync = tasks
            .filter(lt => !lt.sync)
            .map(lt => {
                const { sync, ...task } = lt;
                return task;
            });
        const remoteSyncPromises = tasksToSync.map(lt =>
            fetch(`/api/tasks/${lt.id}`, {
                method: 'PUT',
                body: JSON.stringify(lt),
                signal: ctrl.signal
            })
        );
        setTimeout(() => ctrl.abort(), this._config.syncInterval - 5000);
        try {
            await Promise.all(remoteSyncPromises);
            tasksToSync.forEach(t => this._storage.markSync(t));
        } catch (e) {
            console.log(e);
            setTimeout(
                this.syncToRemote.bind(this),
                this._config.retryInterval
            );
        }
    }

    private async loadAllTasks(abortSignal: AbortSignal) {
        console.log('Loading task sets');
        const fetchP = fetch('/api/tasks', { signal: abortSignal });
        const localP = this._storage.loadTasks();
        await Promise.all([fetchP, localP]);
        const remoteTasks = await fetchP.then(
            result => result.json() as Promise<Task[]>
        );
        const localTasks = await localP;
        return { remoteTasks, localTasks };
    }
}
