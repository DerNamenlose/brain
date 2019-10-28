export function copyAndUpdate<TObject, TField>(
    object: TObject,
    field: keyof TObject,
    newValue: TField
): TObject {
    return {
        ...object,
        [field]: newValue
    };
}
