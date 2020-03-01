import React from 'react';
import AllInclusiveIcon from '@material-ui/icons/AllInclusive';
import CheckIcon from '@material-ui/icons/Check';
import PlayIcon from '@material-ui/icons/PlayArrow';
import { IconButton } from '@material-ui/core';

function PostponeButton(props: { isPostponed: boolean; onClick: () => void }) {
    if (!props.isPostponed) {
        return (
            <IconButton
                style={{
                    backgroundColor: '#808080',
                    margin: '0.5rem'
                }}
                onClick={props.onClick}>
                <AllInclusiveIcon
                    style={{
                        fontSize: '3rem',
                        color: 'white'
                    }}
                />
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
            <PlayIcon
                style={{
                    fontSize: '3rem',
                    color: 'white'
                }}
            />
        </IconButton>
    );
}

export function FinishPostponeButtons(props: {
    isPostponed?: boolean;
    isDone?: boolean;
    onPostponedChange: () => void;
    onDoneChange: () => void;
}) {
    return (
        <div
            style={{
                display: 'flex',
                marginLeft: 'auto',
                marginRight: 'auto'
            }}>
            <PostponeButton
                isPostponed={props.isPostponed || false}
                onClick={props.onPostponedChange}
            />
            <IconButton
                style={{
                    backgroundColor: props.isDone ? '#00A000' : '#A0A0A0',
                    margin: '0.5rem'
                }}
                onClick={props.onDoneChange}>
                <CheckIcon
                    style={{
                        fontSize: '3rem',
                        color: 'white'
                    }}
                />
            </IconButton>
        </div>
    );
}
