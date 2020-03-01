import React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';

export function TaskStart(props: SvgIconProps) {
    return (
        <SvgIcon {...props}>
            <path d='M 3,5 h 3 v 14 H 3 Z' />
            <path d='M 9,10.5 H 15 L 12.5,8 14.6,5.6 21,12 14.6,18.4 12.5,16 15,13.5 H 9 V 10.5 z' />
        </SvgIcon>
    );
}
