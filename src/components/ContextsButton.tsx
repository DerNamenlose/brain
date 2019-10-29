import React from 'react';
import LandscapeIcon from '@material-ui/icons/Landscape';
import { FilterButton } from './FilterButton';
import { IDispatchReceiver, IFilterAction } from '../util/dispatcher';
import { GlobalState } from '../model/GlobalState';
import { Badge } from '@material-ui/core';

/**
 * The contexts menu button
 *
 * @param props The properties of the contexts button
 */
export function ContextsButton(props: IDispatchReceiver) {
    return (
        <GlobalState.Consumer>
            {state => (
                <FilterButton
                    icon={
                        <Badge
                            invisible={state.selectedContexts.length === 0}
                            color='secondary'
                            variant='dot'>
                            <LandscapeIcon />
                        </Badge>
                    }
                    text='Contexts'
                    entries={state.contexts.map(ctx => ({
                        text: ctx,
                        selected: !!state.selectedContexts.find(c => c === ctx)
                    }))}
                    onChange={selectedEntry => {
                        props.dispatch({
                            type: 'context',
                            subtype: selectedEntry.selected
                                ? 'deselect'
                                : 'select',
                            name: selectedEntry.text
                        } as IFilterAction);
                    }}
                />
            )}
        </GlobalState.Consumer>
    );
}
