import { Task, TaskPrio } from 'brain-common';
import { taskWeight } from './order';
import { addDays } from 'date-fns';

describe.only.each([
    // base cases without any urgency factor
    [undefined, undefined, 6],
    ['A', undefined, 0],
    ['F', undefined, 5],
    // urgency correction cases
    ['A', 0, -8], // tasks due today get corrected by -8 -> all will overtake any priority
    ['A', 14, 0] // everything 14 days and up away doesn't get corrected
])(
    'a task with prio %s, %s days away',
    (priority, daysoff, expectedpriority) => {
        test(`has a weight of ${expectedpriority}`, () => {
            const task: Task = {
                id: 'Test',
                title: 'Test title',
                version: 0,
                hash: '',
                due:
                    daysoff === undefined
                        ? undefined
                        : addDays(Date.now(), daysoff).getTime(),
                priority: (priority as unknown) as TaskPrio
            };
            const calculatedPriority = taskWeight(task);
            expect(calculatedPriority).toBe(expectedpriority);
        });
    }
);
