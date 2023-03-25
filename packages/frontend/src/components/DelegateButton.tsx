import React, { useContext } from 'react';
import { FilterButton } from './FilterButton';
import { GlobalState } from '../model/GlobalState';
import { IFilterAction, Dispatcher } from '../util/dispatcher';
import { Badge } from '@material-ui/core';
import { DelegateTaskIcon } from './Icons';

export function DelegateButton() {
    const dispatch = useContext(Dispatcher);
    const state = useContext(GlobalState);
    return (
        <FilterButton
            icon={
                <Badge
                    invisible={
                        (state.config.selectedDelegates?.length || 0) === 0
                    }
                    color='secondary'
                    variant='dot'>
                    <DelegateTaskIcon />
                </Badge>
            }
            text='Delegated to'
            entries={
                state.delegates?.map(delegate => ({
                    text: delegate,
                    selected: !!state.config.selectedDelegates?.find(
                        d => d === delegate
                    )
                })) || []
            }
            onChange={selectedEntry => {
                dispatch({
                    type: 'delegate',
                    subtype: selectedEntry.selected ? 'deselect' : 'select',
                    name: selectedEntry.text
                } as IFilterAction);
            }}
        />
    );
}
