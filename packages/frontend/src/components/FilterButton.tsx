import React, { Fragment, useState } from 'react';
import { ResponsiveButton } from './ResponsiveButton';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@material-ui/core';

export interface FilterEntry {
    text: string;
    selected: boolean;
}

export interface FilterButtonProps {
    entries: FilterEntry[];
    icon: JSX.Element;
    text: string;
    onChange?: (selectedEntry: FilterEntry) => void;
}

export function FilterButton(props: FilterButtonProps) {
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
