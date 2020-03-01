import React from 'react';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { Dialog, Button } from '@material-ui/core';

export function ClearableDatePicker(props: {
    onChange: (newDate: Date | undefined) => void;
    onClose?: () => void;
    open?: boolean;
    date?: Date;
}) {
    return (
        <Dialog open={!!props.open} onClose={props.onClose}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                    value={props.date}
                    variant='static'
                    onChange={newDate =>
                        props.onChange(
                            new Date(newDate?.getTime() || new Date())
                        )
                    }
                />
            </MuiPickersUtilsProvider>
            <Button onClick={() => props.onChange(undefined)}>Clear</Button>
        </Dialog>
    );
}
