import React from 'react';
import TableChartIcon from '@material-ui/icons/TableChart';
import { FilterButton } from './FilterButton';
import { GlobalState, extractProjects } from '../model/GlobalState';
import { IDispatchReceiver } from '../util/dispatcher';

export function ProjectsButton(props: IDispatchReceiver) {
    return (
        <GlobalState.Consumer>
            {state => (
                <FilterButton
                    icon={<TableChartIcon />}
                    text='Projects'
                    entries={extractProjects(state.tasks).map(project => ({
                        text: project.title,
                        selected: false
                    }))}
                />
            )}
        </GlobalState.Consumer>
    );
}
