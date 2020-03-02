import React from 'react';
import AllInclusiveIcon from '@material-ui/icons/AllInclusive';
import CheckIcon from '@material-ui/icons/Check';
import PlayIcon from '@material-ui/icons/PlayArrow';
import { IconButton } from '@material-ui/core';
import { useStyles } from './styles';

function PostponeButton(props: { isPostponed: boolean; onClick: () => void }) {
    const classes = useStyles();
    if (!props.isPostponed) {
        return (
            <IconButton
                style={{
                    backgroundColor: '#A0A0A0',
                    margin: '0.5rem'
                }}
                onClick={props.onClick}>
                <AllInclusiveIcon className={classes.buttonIcon} />
            </IconButton>
        );
    }
    return (
        <IconButton
            style={{
                backgroundColor: '#FFA000',
                margin: '0.5rem'
            }}
            onClick={props.onClick}>
            <PlayIcon className={classes.buttonIcon} />
        </IconButton>
    );
}

export function FinishPostponeButtons(props: {
    isPostponed?: boolean;
    isDone?: boolean;
    onPostponedChange: () => void;
    onDoneChange: () => void;
}) {
    const classes = useStyles();
    return (
        <div
            style={{
                display: 'flex',
                marginLeft: 'auto',
                marginRight: 'auto'
            }}>
            {!props.isDone && (
                <PostponeButton
                    isPostponed={!!props.isPostponed && !props.isDone}
                    onClick={props.onPostponedChange}
                />
            )}
            <IconButton
                style={{
                    backgroundColor: props.isDone ? '#00A000' : '#A0A0A0',
                    margin: '0.5rem'
                }}
                onClick={props.onDoneChange}>
                <CheckIcon className={classes.buttonIcon} />
            </IconButton>
        </div>
    );
}
