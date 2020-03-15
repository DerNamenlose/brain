import { Task, LegacyTask } from 'brain-common';
import { openDB, IDBPDatabase, DBSchema, IDBPTransaction } from 'idb';
import hash from 'object-hash';
import { IGlobalConfig } from '../model/GlobalConfig';

interface TaskDBSchema extends TaskDBSchemav2Schema {
    config: { key: string; value: IGlobalConfig };
}

interface TaskDBSchemav2Schema extends DBSchema {
    tasks: { key: string; value: Task };
}

interface TaskDBv1Schema extends DBSchema {
    tasks: { key: string; value: LegacyTask };
}

export class LocalStorage {
    public async loadTasks(): Promise<Task[]> {
        const db = await this.openDb();
        const tasks = await db
            .transaction('tasks')
            .objectStore('tasks')
            .getAll();
        console.log(`Loaded ${tasks.length} stored tasks`);
        return tasks;
    }

    public async create(task: Task): Promise<void> {
        const versionedTask = LocalStorage.updateVersion({
            ...task,
            id: task.id.toString()
        });
        const db = await this.openDb();
        const tx = db.transaction('tasks', 'readwrite');
        await tx.objectStore('tasks').put(versionedTask);
        await tx.done;
    }

    public async update(task: Task): Promise<void> {
        const versionedTask = LocalStorage.updateVersion({
            ...task,
            id: task.id.toString()
        });
        const db = await this.openDb();
        console.log('Updating', versionedTask);
        const tx = db.transaction('tasks', 'readwrite');
        await tx.objectStore('tasks').put(versionedTask);
        await tx.done;
    }

    public async config(): Promise<IGlobalConfig> {
        const db = await this.openDb();
        const existingConfig = (await db
            .transaction('config')
            .objectStore('config')
            .get('global')) || {
            id: 'global',
            showDone: false,
            showFutureStart: false,
            selectedContexts: [],
            selectedProjects: [],
            selectedTags: [],
            selectedDelegates: []
        };
        if (existingConfig.selectedDelegates === undefined) {
            existingConfig.selectedDelegates = [];
        }
        return existingConfig;
    }

    public async putConfig(config: IGlobalConfig): Promise<void> {
        const db = await this.openDb();
        const storedValue = {
            ...config,
            id: 'global'
        };
        await db
            .transaction('config', 'readwrite')
            .objectStore('config')
            .put(storedValue);
    }

    private static updateVersion(task: Task): Task {
        const newVersion = (task.version || 0) + 1;
        return { ...task, version: newVersion, hash: hash(task) };
    }

    private async openDb() {
        const db = await openDB<TaskDBSchema>('tasks', 3, {
            async upgrade(db, oldVersion, newVersion, transaction) {
                console.log(`Upgrading database to version ${newVersion}`);
                if (oldVersion < 1) {
                    LocalStorage.upgradeV1(db);
                }
                if (oldVersion < 2) {
                    LocalStorage.upgradeV2(transaction);
                }
                if (oldVersion < 3) {
                    LocalStorage.upgradeV3(db);
                }
                console.log('Finished.');
            }
        });
        return db;
    }

    // database upgrade methods
    private static async upgradeV1(db: IDBPDatabase<TaskDBSchema>) {
        console.log('Creating the object store.');
        db.createObjectStore('tasks', { keyPath: 'id' });
    }

    private static async upgradeV2(
        transaction: IDBPTransaction<TaskDBSchema, ('tasks' | 'config')[]>
    ) {
        console.log('Transforming all existing objects to v2 schema');
        const oldDb = await openDB<TaskDBv1Schema>('tasks', 3); // This does feel slightly wrong, but should be OK at this point, as no update has taken place yet
        const objects = await oldDb
            .transaction('tasks', 'readonly')
            .objectStore('tasks')
            .getAll();
        oldDb.close();
        for (let object of objects) {
            const newObject: Task = {
                ...object,
                due: object.due && object.due.getTime(),
                created:
                    (object.created && object.created.getTime()) || Date.now(),
                version: 0,
                hash: ''
            };
            await transaction
                .objectStore('tasks')
                .put(LocalStorage.updateVersion(newObject));
        }
    }

    private static async upgradeV3(db: IDBPDatabase<TaskDBSchema>) {
        db.createObjectStore('config', { keyPath: 'id' });
    }

    public async deleteTask(id: string) {
        const db = await this.openDb();
        const transaction = db.transaction('tasks', 'readwrite');
        await transaction.objectStore('tasks').delete(id);
    }
}
