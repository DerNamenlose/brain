import { Task } from '../model/Task';

const maxDate = new Date('9999-12-31');

function orderDate(t1: Task, t2: Task) {
    const t1due = t1.due || maxDate; // tasks without due date are assumed to be due at a ridiculously late date
    const t2due = t2.due || maxDate;
    if (t1due === t2due) {
        return 0;
    }
    return t1due > t2due ? 1 : -1;
}

/**
 * Order task according to the configuration
 *
 * @param t1 The first task
 * @param t2 The second task
 */
export function order(t1: Task, t2: Task) {
    // currently the order is fixed: done first, due second, priority (eventually) third
    if (!!t1.done === !!t2.done) {
        return orderDate(t1, t2);
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
