import { Task } from 'brain-common';

export interface IDatabaseResult<T> {
    readonly isError: boolean;
    readonly value: T;
}

export enum DatabaseErrorType {
    NotFound,
    Conflict,
    Internal
}

export class DatabaseObject<T> implements IDatabaseResult<T> {
    public readonly value: T;

    public constructor(value: T) {
        this.value = value;
    }

    readonly isError = false;
}

export class DatabaseError<T> implements IDatabaseResult<T> {
    public readonly isError = true;
    public readonly value: T;

    public readonly type: DatabaseErrorType;

    public constructor(type: DatabaseErrorType, value: T = undefined) {
        this.type = type;
        this.value = value;
    }
}
