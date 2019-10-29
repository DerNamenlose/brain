import React, { useState, useContext, useEffect } from 'react';
import LandscapeIcon from '@material-ui/icons/Landscape';
import { FilterButton } from './FilterButton';
import { IDispatchReceiver, IFilterAction } from '../util/dispatcher';
import { GlobalState } from '../model/GlobalState';

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
                    icon={<LandscapeIcon />}
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
