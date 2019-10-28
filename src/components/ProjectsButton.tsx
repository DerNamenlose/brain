import React from 'react';
import TableChartIcon from '@material-ui/icons/TableChart';
import { FilterButton } from './FilterButton';
import { GlobalState } from '../model/GlobalState';
import { IDispatchReceiver } from '../util/dispatcher';

export function ProjectsButton(props: IDispatchReceiver) {
    return (
        <GlobalState.Consumer>
            {state => (
                <FilterButton
                    icon={<TableChartIcon />}
                    text='Projects'
                    entries={state.projects.map(project => ({
                        text: project,
                        selected: false
                    }))}
                />
            )}
        </GlobalState.Consumer>
    );
}
