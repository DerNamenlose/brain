import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    FormControl,
    InputLabel,
    Input,
    ButtonGroup,
    IconButton
} from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import CancelIcon from '@material-ui/icons/Cancel';

export function DelegateInputDialog(props: {
    open: boolean;
    onClose: () => void;
    onNewDelegate: (newDelegate: string) => void;
}) {
    const [delegate, setDelegate] = useState('');
    return (
        <Dialog open={props.open} onClose={props.onClose}>
            <DialogTitle>Who is responsible for this task?</DialogTitle>
            <FormControl>
                <InputLabel htmlFor='delegate'>Delegate</InputLabel>
                <Input
                    id='delegate'
                    value={delegate}
                    placeholder='Delegate'
                    onChange={ev => setDelegate(ev.target.value)}
                />
            </FormControl>
            <ButtonGroup>
                <IconButton
                    onClick={() => {
                        props.onNewDelegate(delegate);
                        props.onClose();
                    }}>
                    <CheckIcon />
                </IconButton>
                <IconButton onClick={props.onClose}>
                    <CancelIcon />
                </IconButton>
            </ButtonGroup>
        </Dialog>
    );
}
