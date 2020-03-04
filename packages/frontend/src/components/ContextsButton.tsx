import React, { useContext } from 'react';
import LandscapeIcon from '@material-ui/icons/Landscape';
import { FilterButton } from './FilterButton';
import { IFilterAction, Dispatcher } from '../util/dispatcher';
import { GlobalState } from '../model/GlobalState';
import { Badge } from '@material-ui/core';

/**
 * The contexts menu button
 *
 * @param props The properties of the contexts button
 */
export function ContextsButton() {
    const dispatch = useContext(Dispatcher);
    const state = useContext(GlobalState);
    return (
        <FilterButton
            icon={
                <Badge
                    invisible={state.config.selectedContexts.length === 0}
                    color='secondary'
                    variant='dot'>
                    <LandscapeIcon />
                </Badge>
            }
            text='Contexts'
            entries={state.contexts.map(ctx => ({
                text: ctx,
                selected: !!state.config.selectedContexts.find(c => c === ctx)
            }))}
            onChange={selectedEntry => {
                dispatch({
                    type: 'context',
                    subtype: selectedEntry.selected ? 'deselect' : 'select',
                    name: selectedEntry.text
                } as IFilterAction);
            }}
        />
    );
}
