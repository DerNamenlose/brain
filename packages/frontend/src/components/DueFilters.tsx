import React from 'react';
import WatchLaterIcon from '@material-ui/icons/WatchLater';

import { FilterButton } from './FilterButton';
import { GlobalState } from '../model/GlobalState';
import { IDispatchReceiver } from '../util/dispatcher';
import { Badge } from '@material-ui/core';

export function DueFilters(props: IDispatchReceiver) {
    return (
        <GlobalState.Consumer>
            {state => (
                <FilterButton
                    icon={
                        <Badge
                            invisible={state.dueIn === undefined}
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
                                state.dueIn !== undefined && state.dueIn === 0
                            ),
                            value: 0
                        },
                        {
                            text: 'Today',
                            selected: !!(
                                state.dueIn !== undefined && state.dueIn === 1
                            ),
                            value: 1
                        },
                        {
                            text: 'Next week',
                            selected: !!(
                                state.dueIn !== undefined && state.dueIn === 7
                            ),
                            value: 7
                        },
                        {
                            text: 'Next month',
                            selected: !!(
                                state.dueIn !== undefined && state.dueIn === 31
                            ),
                            value: 31
                        }
                    ]}
                    onChange={selectedEntry => {
                        props.dispatch({
                            type: 'due',
                            subtype: selectedEntry.selected
                                ? 'deselect'
                                : 'select',
                            value: selectedEntry.value
                        });
                    }}
                />
            )}
        </GlobalState.Consumer>
    );
}
