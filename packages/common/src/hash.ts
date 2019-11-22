import * as hash from 'object-hash';
import { Task } from '.';

export function calculateVersionHash(task: Task): string {
    return hash(task, {
        excludeKeys: key => key === 'version' || key === 'hash'
    });
}
