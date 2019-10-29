import React from 'react';
import TableChartIcon from '@material-ui/icons/TableChart';
import { FilterButton } from './FilterButton';
import { GlobalState } from '../model/GlobalState';
import { IDispatchReceiver, IFilterAction } from '../util/dispatcher';

export function ProjectsButton(props: IDispatchReceiver) {
    return (
        <GlobalState.Consumer>
            {state => (
                <FilterButton
                    icon={<TableChartIcon />}
                    text='Projects'
                    entries={state.projects.map(project => ({
                        text: project,
                        selected: !!state.selectedProjects.find(
                            p => p === project
                        )
                    }))}
                    onChange={selectedEntry => {
                        props.dispatch({
                            type: 'project',
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
