import React, { Fragment, useState } from 'react';
import { ResponsiveButton } from './ResponsiveButton';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@material-ui/core';

export interface FilterEntry<T> {
    text: string;
    selected: boolean;
    value?: T;
}

export interface FilterButtonProps<T> {
    entries: FilterEntry<T>[];
    icon: JSX.Element;
    text: string;
    onChange?: (selectedEntry: FilterEntry<T>) => void;
}

export function FilterButton<T>(props: FilterButtonProps<T>) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    return (
        <Fragment>
            <ResponsiveButton
                aria-controls='simple-menu'
                aria-haspopup='true'
                color='inherit'
                icon={props.icon}
                extended={props.text}
                onClick={(ev: React.MouseEvent<HTMLButtonElement>) =>
                    setAnchorEl(ev.currentTarget)
                }
                disabled={props.entries.length === 0}
            />
            <Menu
                id='contexts-menu'
                keepMounted
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={ev => setAnchorEl(null)}>
                {props.entries.map((entry, index) => (
                    <MenuItem
                        key={entry.text}
                        onClick={() => {
                            props.onChange && props.onChange(entry);
                            setAnchorEl(null);
                        }}
                        selected={entry.selected}>
                        <ListItemIcon>{props.icon}</ListItemIcon>
                        <ListItemText>{entry.text}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </Fragment>
    );
}
