import React, { useState, useContext, useEffect } from 'react';
import LandscapeIcon from '@material-ui/icons/Landscape';
import { FilterButton } from './FilterButton';
import { IDispatchReceiver, IContextAction } from '../util/dispatcher';
import { GlobalState, extractContexts } from '../model/GlobalState';

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
                    entries={extractContexts(state.tasks).map(ctx => ({
                        text: ctx,
                        selected: !!state.selectedContexts.find(c => c === ctx)
                    }))}
                    onChange={selectedEntry => {
                        props.dispatch({
                            type: selectedEntry.selected
                                ? 'context.deselect'
                                : 'context.select',
                            context: selectedEntry.text
                        } as IContextAction);
                    }}
                />
            )}
        </GlobalState.Consumer>
    );
}
