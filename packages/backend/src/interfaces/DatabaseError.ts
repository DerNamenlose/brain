export interface IDatabaseResult {
    readonly isError: boolean;
}

export enum DatabaseErrorType {
    NotFound,
    Conflict
}

export class DatabaseObject<T> implements IDatabaseResult {
    public readonly value: T;

    public constructor(value: T) {
        this.value = value;
    }

    readonly isError = false;
}

export class DatabaseError implements IDatabaseResult {
    public readonly isError = true;

    public readonly type: DatabaseErrorType;

    public constructor(type: DatabaseErrorType) {
        this.type = type;
    }
}
