import { Task } from 'brain-common';
import { differenceInDays } from 'date-fns';

export const maxDate = new Date('9999-12-31').getTime();

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

/**
 * Calculate the task weight in a way such, that tasks, that are
 * due in the near future get more and more important, the shorter
 * their deadline is.
 *
 * @param t The task to calculate the weight for
 */
export function taskWeight(t: Task): number {
    const numericPrio = (t.priority ?? 'G').charCodeAt(0) - 'A'.charCodeAt(0); // the numeric priority with 0 being the most important
    const daysOff = differenceInDays(t.due || maxDate, Date.now());
    const urgencyCorrection =
        daysOff >= 14 ? 0 : 0.03 * daysOff * daysOff - daysOff + 8; // this is a quadratic approximation for the intended correction
    return numericPrio - urgencyCorrection;
}

export const defaultTaskOrder = (t1: Task, t2: Task) =>
    order(t1, t2, [
        t => !!t.done,
        t => taskWeight(t),
        t => t.priority || 'G',
        t => t.title.toLocaleLowerCase()
    ]);
