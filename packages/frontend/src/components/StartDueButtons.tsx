import React, { useState } from 'react';
import { IconButton } from '@material-ui/core';
import AlarmOnIcon from '@material-ui/icons/AlarmOn';
import { TaskStart } from './Icons';
import { ClearableDatePicker } from './ClearableDatePicker';
import { useStyles } from './styles';

export function StartDueButtons(props: {
    due?: Date;
    start?: Date;
    onDueChange: (due?: Date) => void;
    onStartChange: (start?: Date) => void;
}) {
    const classes = useStyles();
    const [dueOpen, setDueOpen] = useState(false);
    const [startOpen, setStartOpen] = useState(false);
    return (
        <div
            style={{
                display: 'flex',
                marginLeft: 'auto',
                marginRight: 'auto'
            }}>
            <IconButton
                style={{
                    backgroundColor: !!props.due ? '#00A000' : '#A0A0A0',
                    margin: '0.5rem'
                }}
                onClick={() => {
                    setDueOpen(true);
                }}>
                <AlarmOnIcon className={classes.buttonIcon} />
            </IconButton>
            <IconButton
                style={{
                    backgroundColor: !!props.start ? '#00A000' : '#A0A0A0',
                    margin: '0.5rem'
                }}
                onClick={() => {
                    setStartOpen(true);
                }}>
                <TaskStart className={classes.buttonIcon} />
            </IconButton>
            <ClearableDatePicker
                open={dueOpen}
                date={props.due}
                onClose={() => setDueOpen(false)}
                onChange={newDate => {
                    props.onDueChange(newDate);
                    setDueOpen(false);
                }}
            />
            <ClearableDatePicker
                open={startOpen}
                date={props.start}
                onClose={() => setStartOpen(false)}
                onChange={newDate => {
                    props.onStartChange(newDate);
                    setStartOpen(false);
                }}
            />
        </div>
    );
}
