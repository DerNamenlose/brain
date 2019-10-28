import { Task } from '../model/Task';

/**
 * Order tasks by open first, done second
 * @param t1 The first task
 * @param t2 The second task
 */
export function orderByDone(t1: Task, t2: Task) {
    if (!!t1.done === !!t2.done) {
        return 0;
    }
    return t1.done ? 1 : -1;
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
