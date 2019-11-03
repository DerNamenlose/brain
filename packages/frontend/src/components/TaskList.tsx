import React from 'react';
import { List } from '@material-ui/core';
import { TaskListItem } from './TaskListItem';
import { defaultTaskOrder } from '../util/order';
import { Task } from 'brain-common';

export interface TaskListProps {
    tasks: Task[];
}

export function TaskList(props: TaskListProps) {
    return (
        <List>
            {props.tasks.sort(defaultTaskOrder).map(task => (
                <TaskListItem key={task.id.toString()} task={task} />
            ))}
        </List>
    );
}
