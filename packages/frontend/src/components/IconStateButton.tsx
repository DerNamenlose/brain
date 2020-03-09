import React from 'react';
import { IconButton } from '@material-ui/core';
import { useStyles } from './styles';

export function IconStateButton(props: {
    activeColor: string;
    inactiveColor: string;
    text?: string;
    icon: JSX.Element;
    activeIcon?: JSX.Element;
    onClick?: () => void;
    active: boolean;
}) {
    const classes = useStyles();
    return (
        <div
            style={{
                display: 'grid'
            }}>
            <IconButton
                className={classes.button}
                style={{
                    backgroundColor: props.active
                        ? props.activeColor
                        : props.inactiveColor,
                    margin: '0.5rem'
                }}
                onClick={() => props.onClick && props.onClick()}>
                {!props.active && (
                    <span className={classes.buttonIcon}>{props.icon}</span>
                )}
                {props.active && (
                    <span className={classes.buttonIcon}>
                        {props.activeIcon || props.icon}
                    </span>
                )}
            </IconButton>
            <p className={classes.buttonText}>{props.active && props?.text}</p>
        </div>
    );
}
