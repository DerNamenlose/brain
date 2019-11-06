import { Task, LegacyTask } from 'brain-common';
import { openDB, IDBPDatabase, DBSchema, IDBPTransaction } from 'idb';
import { Guid } from 'guid-typescript';
import hash from 'object-hash';
import { TaskDto } from 'brain-common';

interface TaskDBSchema extends DBSchema {
    tasks: { key: string; value: TaskDto };
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
        return tasks.map(task => ({
            ...task,
            id: Guid.parse(task.id)
        }));
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

    private static updateVersion(task: TaskDto): TaskDto {
        const newVersion = (task.version || 0) + 1;
        return { ...task, version: newVersion, hash: hash(task) };
    }

    private async openDb() {
        const db = await openDB<TaskDBSchema>('tasks', 2, {
            async upgrade(db, oldVersion, newVersion, transaction) {
                console.log(`Upgrading database to version ${newVersion}`);
                if (oldVersion < 1) {
                    LocalStorage.upgradeV1(db);
                }
                if (oldVersion < 2) {
                    LocalStorage.upgradeV2(transaction);
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
        transaction: IDBPTransaction<TaskDBSchema, 'tasks'[]>
    ) {
        console.log('Transforming all existing objects to v2 schema');
        const oldDb = await openDB<TaskDBv1Schema>('tasks', 2); // This does feel slightly wrong, but should be OK at this point, as no update has taken place yet
        const objects = await oldDb
            .transaction('tasks', 'readonly')
            .objectStore('tasks')
            .getAll();
        oldDb.close();
        for (let object of objects) {
            const newObject: TaskDto = {
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
}
