import React from 'react';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import { FilterButton } from './FilterButton';
import { GlobalState, extractTags } from '../model/GlobalState';
import { IDispatchReceiver } from '../util/dispatcher';

/**
 * The tags menu button
 *
 * @param props The properties of the tags button
 */
export function TagsButton(props: IDispatchReceiver) {
    return (
        <GlobalState.Consumer>
            {state => (
                <FilterButton
                    icon={<LocalOfferIcon />}
                    text='Tags'
                    entries={extractTags(state.tasks).map(tag => ({
                        text: tag,
                        selected: false
                    }))}
                />
            )}
        </GlobalState.Consumer>
    );
}
