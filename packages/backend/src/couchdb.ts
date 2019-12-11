import { IDatabase } from './interfaces/IDatabase';
import { Task, TaskBase } from 'brain-common';
import {
    IDatabaseResult,
    DatabaseObject,
    DatabaseError,
    DatabaseErrorType
} from './interfaces/DatabaseError';
import * as nano from 'nano';
import { deepEqual } from 'fast-equals';

export const DesignDoc = {
    _id: '_design/tasks',
    views: {
        available: {
            map: `function(doc) {
                if (doc.type == 'task')
                {
                    emit(doc.owner, doc);
                    if (doc.access) {
                      doc.access.forEach(function(otherUser) {
                        emit(otherUser, doc)
                      })
                    }
                }
              }`
        }
    }
};

/**
 * Interface of objects stored in the database
 */
export interface TaskDbo extends TaskBase {
    _id: string;
    _rev?: string;
    type: 'task';
}

/**
 * CouchDB implementation of the IDatabase interface
 */
export class CouchDB implements IDatabase {
    private _url: string;
    private _dbName: string;
    private _server: nano.ServerScope;

    constructor(url: string, db: string) {
        this._url = url;
        this._dbName = db;
        this._server = nano(this._url);
    }

    async getAllTasks(): Promise<Task[]> {
        const db = this._server.db.use(this._dbName);
        const dbResult = await db.view('tasks', 'available');
        return dbResult.rows.map(entry =>
            CouchDB.toTaskDto(entry.value as TaskDbo)
        );
    }

    async getById(id: string): Promise<IDatabaseResult<Task>> {
        const db = this._server.db.use(this._dbName);
        try {
            const dbResult = await db.get(`t${id}`);
            return new DatabaseObject(CouchDB.toTaskDto(dbResult as TaskDbo));
        } catch (e) {
            return new DatabaseError<Task>(DatabaseErrorType.NotFound);
        }
    }

    async saveTask(task: Task): Promise<IDatabaseResult<Task>> {
        const db = this._server.db.use(this._dbName);
        try {
            await db.insert(CouchDB.toTaskDbo(task));
        } catch (e) {
            console.log(e);
            if (e.statusCode === 409) {
                const existing = await this.getById(task.id);
                if (!CouchDB.isSameUpdate(task, existing.value)) {
                    return new DatabaseError(
                        DatabaseErrorType.Conflict,
                        existing.value
                    );
                }
            }
        }
        return new DatabaseObject<Task>(undefined);
    }

    async checkAndUpdate() {
        const db = this._server.db.use(this._dbName);
        try {
            await db.insert(DesignDoc);
            console.log('Updated database');
        } catch (e) {
            if (e.statusCode !== 409) {
                console.log(e);
            }
        }
    }

    private static toTaskDto(dbo: TaskDbo): Task {
        const { _id, _rev, ...task } = dbo;
        return { id: _id.substring(1), hash: _rev, ...task } as Task;
    }

    private static toTaskDbo(dto: Task): TaskDbo {
        const { id, hash, ...task } = dto;
        const dbo: TaskDbo = {
            _id: `t${id}`,
            type: 'task',
            ...task
        };
        if (!!hash) {
            dbo._rev = hash;
        }
        return dbo;
    }

    /**
     * Compare, whether two tasks are actually the same apart from their version hash
     * @param newTask The new task
     * @param existingTask The existing version
     */
    private static isSameUpdate(newTask: Task, existingTask: Task): boolean {
        const nt = { ...newTask, hash: '' };
        const et = { ...existingTask, hash: '' };
        return deepEqual(nt, et);
    }
}
