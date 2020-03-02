import React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';

export function TaskStartIcon(props: SvgIconProps) {
    return (
        <SvgIcon {...props}>
            <path d='M 3,5 h 3 v 14 H 3 Z' />
            <path d='M 9,10.5 H 15 L 12.5,8 14.6,5.6 21,12 14.6,18.4 12.5,16 15,13.5 H 9 V 10.5 z' />
        </SvgIcon>
    );
}

export function DelegateTaskIcon(props: SvgIconProps) {
    return (
        <SvgIcon {...props}>
            <path d='M 8,21 h 14 C 22 10, 8 10, 8 21 z' />
            <circle cx='15' cy='5' r='4' />
            <path
                d='M 5,8 L 9,12 5,16'
                strokeWidth='1.5'
                stroke='white'
                fill='none'
            />
            <path
                d='M 1,8 L 5,12 1,16'
                strokeWidth='1.5'
                stroke='white'
                fill='none'
            />
        </SvgIcon>
    );
}

export function DeleteDelegationIcon(props: SvgIconProps) {
    return (
        <SvgIcon {...props}>
            <path d='M 8,21 h 13 C 21 20, 22 13, 18 11 z' />
            <path d='M 12,7 L 18,1 C 13 -2, 10 3, 12 7 z' />
            <path
                d='M 5,8 L 8,11'
                strokeWidth='1.5'
                stroke='white'
                fill='none'
            />
            <path
                d='M 1,8 L 5,12 1,16'
                strokeWidth='1.5'
                stroke='white'
                fill='none'
            />
            <path d='M 0,24 L 24,0' strokeWidth={2} stroke='white' />
        </SvgIcon>
    );
}
