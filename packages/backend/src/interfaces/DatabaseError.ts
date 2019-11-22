export enum DatabaseErrorType {
    NotFound,
    Conflict
}

export class DatabaseError {
    public readonly type: DatabaseErrorType;

    public constructor(type: DatabaseErrorType) {
        this.type = type;
    }
}
