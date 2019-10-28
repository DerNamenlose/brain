import React from 'react';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import { FilterButton } from './FilterButton';

export interface TagsButtonProps {
    tags: string[];
}

/**
 * The tags menu button
 *
 * @param props The properties of the tags button
 */
export function TagsButton(props: TagsButtonProps) {
    return (
        <FilterButton
            icon={<LocalOfferIcon />}
            text='Tags'
            entries={props.tags.map(tag => ({ text: tag, selected: false }))}
        />
    );
}
