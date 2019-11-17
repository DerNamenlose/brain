import React, { useContext } from 'react';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import { FilterButton } from './FilterButton';
import { GlobalState } from '../model/GlobalState';
import { IFilterAction, Dispatcher } from '../util/dispatcher';
import { Badge } from '@material-ui/core';

/**
 * The tags menu button
 *
 * @param props The properties of the tags button
 */
export function TagsButton() {
    const dispatch = useContext(Dispatcher);
    return (
        <GlobalState.Consumer>
            {state => (
                <FilterButton
                    icon={
                        <Badge
                            invisible={state.config.selectedTags.length === 0}
                            color='secondary'
                            variant='dot'>
                            <LocalOfferIcon />
                        </Badge>
                    }
                    text='Tags'
                    entries={state.tags.map(tag => ({
                        text: tag,
                        selected: !!state.config.selectedTags.find(
                            t => t === tag
                        )
                    }))}
                    onChange={selectedEntry => {
                        dispatch({
                            type: 'tag',
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
