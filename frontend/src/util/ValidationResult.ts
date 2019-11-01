export class ValidationResult {
    private _results: { field: string; message: string }[] = [];

    public hasAnyError(): boolean {
        return this._results.length !== 0;
    }

    public hasError(field: string): boolean {
        return this._results.findIndex(result => result.field === field) !== -1;
    }

    public error(field: string): string | undefined {
        const result = this._results.find(result => result.field === field);
        return result && result.message;
    }

    public addError(field: string, message: string) {
        this._results.push({ field: field, message: message });
    }
}
