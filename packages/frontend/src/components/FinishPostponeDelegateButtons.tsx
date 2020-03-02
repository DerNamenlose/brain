import React from 'react';
import AllInclusiveIcon from '@material-ui/icons/AllInclusive';
import CheckIcon from '@material-ui/icons/Check';
import PlayIcon from '@material-ui/icons/PlayArrow';
import { IconButton } from '@material-ui/core';
import { DelegateTaskIcon, DeleteDelegationIcon } from './Icons';
import { IconStateButton } from './IconStateButton';

export function FinishPostponeDelegateButtons(props: {
    isPostponed?: boolean;
    isDone?: boolean;
    delegatedTo?: string;
    onPostponedChange: () => void;
    onDoneChange: () => void;
    onDelegateChange: () => void;
}) {
    return (
        <div
            style={{
                display: 'flex',
                marginLeft: 'auto',
                marginRight: 'auto'
            }}>
            {!(props.isDone || !!props.delegatedTo) && (
                <IconStateButton
                    active={!!props.isPostponed && !props.isDone}
                    activeColor='#FFA000'
                    inactiveColor='#A0A0A0'
                    icon={<AllInclusiveIcon />}
                    activeIcon={<PlayIcon />}
                    onClick={props.onPostponedChange}
                />
            )}
            <IconStateButton
                active={!!props.isDone}
                activeColor='#00A000'
                inactiveColor='#A0A0A0'
                icon={<CheckIcon />}
                onClick={props.onDoneChange}
            />
            {!props.isDone && (
                <IconStateButton
                    active={!!props.delegatedTo}
                    activeColor='#FFA000'
                    inactiveColor='#A0A0A0'
                    icon={<DelegateTaskIcon />}
                    activeIcon={<DeleteDelegationIcon />}
                    text={props.delegatedTo}
                    onClick={props.onDelegateChange}
                />
            )}
        </div>
    );
}
