import { Task } from './Task';

export interface IEvent {
    timestamp: number; // the timestamp of the event in ms
}

export interface IEventDto extends IEvent {
    id: string;
}

export interface CreateEvent extends IEvent {
    eventType: 'create';
    task: Task;
}

export interface UpdateEvent extends IEvent {
    eventType: 'update';
    task: Task;
}

export interface DeleteEvent extends IEvent {
    eventType: 'delete';
    taskId: string;
}

export type CreateEventDto = CreateEvent & IEventDto;
export type UpdateEventDto = UpdateEvent & IEventDto;
export type DeleteEventDto = DeleteEvent & IEventDto;

export type TaskEventDto = CreateEventDto | UpdateEventDto | DeleteEventDto;
