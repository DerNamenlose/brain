import React from 'react';
import { Button, Hidden } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';

export interface ResponsiveButtonProps extends ButtonProps {
    icon: JSX.Element;
    extended: JSX.Element | string;
}

export function ResponsiveButton(props: ResponsiveButtonProps) {
    return (
        <Button startIcon={props.icon} {...props}>
            <Hidden xsDown>{props.extended}</Hidden>
        </Button>
    );
}
