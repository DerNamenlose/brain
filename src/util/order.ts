export const maxDate = new Date('9999-12-31');

/**
 * order objects by multiple fields
 *
 * @param t1 The first object
 * @param t2 The second object
 */
export function order<T>(t1: T, t2: T, accessors: ((obj: T) => any)[]) {
    for (let accessor of accessors) {
        const v1 = accessor(t1);
        const v2 = accessor(t2);
        if (v1 !== v2) {
            return v1 > v2 ? 1 : -1;
        }
    }
    return 0;
}

/**
 * Sort and array and make its entries unique
 * @param elements The array of strings to sort and make unique
 */
export function sortAndUnique<T>(
    elements: T[],
    compare: (e1: T, e2: T) => number
): T[] {
    return elements
        .sort(compare)
        .filter(
            (value, index, elements) =>
                index === 0 || compare(elements[index - 1], value) !== 0
        );
}

export function sortAndUniqueString(strings: string[]) {
    return sortAndUnique(strings, (s1, s2) => s1.localeCompare(s2));
}
