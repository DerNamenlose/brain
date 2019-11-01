import { Task } from '../model/Task';
import { openDB } from 'idb';
import { Guid } from 'guid-typescript';

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
        })) as Task[];
    }

    public async create(task: Task): Promise<void> {
        const db = await this.openDb();
        const storedObject = { ...task, id: task.id.toString() };
        const tx = db.transaction('tasks', 'readwrite');
        await tx.objectStore('tasks').put(storedObject);
        await tx.done;
    }

    public async update(task: Task): Promise<void> {
        const db = await this.openDb();
        const storedObject = { ...task, id: task.id.toString() };
        const tx = db.transaction('tasks', 'readwrite');
        await tx.objectStore('tasks').put(storedObject);
        await tx.done;
    }

    private async openDb() {
        const db = await openDB('tasks', 1, {
            upgrade(db, oldVersion, newVersion, transaction) {
                console.log('Upgrading database');
                db.createObjectStore('tasks', { keyPath: 'id' });
            }
        });
        return db;
    }
}
