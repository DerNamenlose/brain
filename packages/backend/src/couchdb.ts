import { IDatabase } from './interfaces/IDatabase';
import { Task } from 'brain-common';
import { IDatabaseResult } from './interfaces/DatabaseError';
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
        const tasks = await db.view('tasks', 'available');
        return tasks.rows.map(entry => {
            const { _id, _rev, ...task } = entry.value as any;
            return { id: _id.substring(1), ...task } as Task;
        });
    }

    getById(id: string): Promise<IDatabaseResult> {
        throw new Error('Method not implemented.');
    }

    saveTask(task: Task): Promise<IDatabaseResult> {
        throw new Error('Method not implemented.');
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
}
