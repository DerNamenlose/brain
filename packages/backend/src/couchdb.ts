import { IDatabase } from './interfaces/IDatabase';
import {
    Task,
    TaskEventDto,
    IEvent,
    IEventDto,
    CreateEvent,
    UpdateEvent,
    DeleteEvent
} from 'brain-common';
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
        },
        events: {
            map: `function(doc) {
                if (doc.type == 'event')
                {
                    emit(doc.streamId, doc);
                } 
            }`
        }
    }
};

interface TaskDbo extends Task {
    _id: string;
    _rev: string;
    type: 'task';
}

interface IEventDbo extends IEvent {
    _id: string;
    _rev?: string;
    type: 'event';
    streamId: string;
}

type CreateEventDbo = CreateEvent & IEventDbo;
type UpdateEventDbo = UpdateEvent & IEventDbo;
type DeleteEventDbo = DeleteEvent & IEventDbo;

type EventDbo = CreateEventDbo | UpdateEventDbo | DeleteEventDbo;

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
            CouchDB.toTask(entry.value as TaskDbo)
        );
    }

    async getById(id: string): Promise<IDatabaseResult<Task>> {
        const db = this._server.db.use(this._dbName);
        try {
            const dbResult = await db.get(`t${id}`);
            return new DatabaseObject(CouchDB.toTask(dbResult as TaskDbo));
        } catch (e) {
            return new DatabaseError<Task>(DatabaseErrorType.NotFound);
        }
    }

    async handleEvents(
        id: string,
        events: TaskEventDto[]
    ): Promise<IDatabaseResult<Task>> {
        const db = this._server.db.use(this._dbName);
        try {
            const existingEvents = await db.fetchRevs({
                keys: events.map(ev => `e${ev.id}`)
            });
            console.log('Existing', existingEvents);
            const newEvents = events.filter(
                e => !existingEvents.rows.find(ee => ee.id === `e${e.id}`)
            );
            console.log('New', newEvents);
            const result = await db.bulk({
                docs: newEvents.map(ne => CouchDB.toEventDbo(id, ne))
            });
            console.log(result);
        } catch (e) {
            console.log(e);
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

    async events(id: string): Promise<TaskEventDto[]> {
        const db = this._server.use(this._dbName);
        const dbEvents = await db.view('tasks', 'events', {
            key: id,
            include_docs: true
        });
        return dbEvents.rows.map(row =>
            CouchDB.toEventDto(row.doc as EventDbo)
        );
    }

    private static toTask(dbo: TaskDbo): Task {
        const { _id, _rev, ...task } = dbo;
        return { id: _id.substring(1), hash: _rev, ...task } as Task;
    }

    private static toEventDbo(streamId: string, dto: TaskEventDto): EventDbo {
        const { id, ...ev } = dto;
        return {
            _id: `e${id}`,
            type: 'event',
            streamId: streamId,
            ...ev
        };
    }

    private static toEventDto(dbo: EventDbo): TaskEventDto {
        const { _id, _rev, type, streamId, ...ev } = dbo;
        return {
            id: _id.substr(1),
            ...ev
        };
    }
}
