import React from 'react';
import { List } from '@material-ui/core';
import { TaskListItem } from './TaskListItem';
import { order, maxDate } from '../util/order';
import { Task } from 'brain-common';

export interface TaskListProps {
    tasks: Task[];
}

export function TaskList(props: TaskListProps) {
    return (
        <List>
            {props.tasks
                .sort((t1, t2) =>
                    order(t1, t2, [
                        t => !!t.done,
                        t => (t.due || maxDate).getTime(),
                        t => t.priority || 'Z',
                        t => t.title
                    ])
                )
                .map(task => (
                    <TaskListItem key={task.id.toString()} task={task} />
                ))}
        </List>
    );
}
