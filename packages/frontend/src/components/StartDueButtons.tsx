import React, { useState } from 'react';
import AlarmOnIcon from '@material-ui/icons/AlarmOn';
import { TaskStartIcon } from './Icons';
import { ClearableDatePicker } from './ClearableDatePicker';
import { IconStateButton } from './IconStateButton';
import { toDateDisplay } from '../util/displayHelper';

export function StartDueButtons(props: {
    due?: Date;
    start?: Date;
    onDueChange: (due?: Date) => void;
    onStartChange: (start?: Date) => void;
}) {
    const [dueOpen, setDueOpen] = useState(false);
    const [startOpen, setStartOpen] = useState(false);
    return (
        <div
            style={{
                display: 'flex',
                marginLeft: 'auto',
                marginRight: 'auto'
            }}>
            <IconStateButton
                active={!!props.due}
                activeColor='#00A000'
                inactiveColor='#A0A0A0'
                icon={<AlarmOnIcon />}
                text={props.due && toDateDisplay(props.due.getTime())}
                onClick={() => setDueOpen(true)}
            />
            <IconStateButton
                active={!!props.start}
                activeColor='#00A000'
                inactiveColor='#A0A0A0'
                icon={<TaskStartIcon />}
                text={props.start && toDateDisplay(props.start.getTime())}
                onClick={() => setStartOpen(true)}
            />
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
