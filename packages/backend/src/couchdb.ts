import { IDatabase } from './interfaces/IDatabase';
import { Task } from 'brain-common';
import {
    IDatabaseResult,
    DatabaseObject,
    DatabaseError,
    DatabaseErrorType
} from './interfaces/DatabaseError';
import * as nano from 'nano';

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

export interface TaskDbo extends Task {
    _id: string;
    _rev: string;
    type: 'task';
}

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
        const db = this._server.use(this._dbName);
        const dbResult = await db.view('tasks', 'available');
        return dbResult.rows.map(entry =>
            CouchDB.toTask(entry.value as TaskDbo)
        );
    }

    async getById(id: string): Promise<IDatabaseResult> {
        const db = this._server.use(this._dbName);
        try {
            const dbResult = await db.get(`t${id}`);
            return new DatabaseObject(CouchDB.toTask(dbResult as TaskDbo));
        } catch (e) {
            return new DatabaseError(DatabaseErrorType.NotFound);
        }
    }

    async saveTask(task: Task): Promise<IDatabaseResult> {
        const { id, ...dto } = task;
        try {
            const db = this._server.db.use(this._dbName);
            await db.insert({
                _id: `t${id}`,
                ...dto
            });
            return new DatabaseObject(task);
        } catch (e) {
            return new DatabaseError(DatabaseErrorType.Conflict);
        }
    }

    async checkAndUpdate() {
        const db = this._server.use(this._dbName);
        try {
            await db.insert(DesignDoc);
            console.log('Updated database');
        } catch (e) {
            console.log(e);
        }
    }

    private static toTask(dbo: TaskDbo): Task {
        const { _id, _rev, ...task } = dbo;
        return { id: _id.substring(1), ...task } as Task;
    }
}
