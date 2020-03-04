import React, { useContext } from 'react';
import WatchLaterIcon from '@material-ui/icons/WatchLater';

import { FilterButton } from './FilterButton';
import { GlobalState } from '../model/GlobalState';
import { Badge } from '@material-ui/core';
import { Dispatcher } from '../util/dispatcher';

export function DueFilters() {
    const dispatch = useContext(Dispatcher);
    const state = useContext(GlobalState);
    return (
        <FilterButton
            icon={
                <Badge
                    invisible={state.config.dueIn === undefined}
                    color='secondary'
                    variant='dot'>
                    <WatchLaterIcon />
                </Badge>
            }
            text='Due'
            entries={[
                {
                    text: 'Overdue',
                    selected: !!(
                        state.config.dueIn !== undefined &&
                        state.config.dueIn === 0
                    ),
                    value: 0
                },
                {
                    text: 'Today',
                    selected: !!(
                        state.config.dueIn !== undefined &&
                        state.config.dueIn === 1
                    ),
                    value: 1
                },
                {
                    text: 'Next week',
                    selected: !!(
                        state.config.dueIn !== undefined &&
                        state.config.dueIn === 7
                    ),
                    value: 7
                },
                {
                    text: 'Next month',
                    selected: !!(
                        state.config.dueIn !== undefined &&
                        state.config.dueIn === 31
                    ),
                    value: 31
                }
            ]}
            onChange={selectedEntry => {
                dispatch({
                    type: 'due',
                    subtype: selectedEntry.selected ? 'deselect' : 'select',
                    value: selectedEntry.value
                });
            }}
        />
    );
}
