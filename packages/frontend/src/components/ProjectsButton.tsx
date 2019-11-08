import React, { useContext } from 'react';
import TableChartIcon from '@material-ui/icons/TableChart';
import { FilterButton } from './FilterButton';
import { GlobalState } from '../model/GlobalState';
import { IFilterAction, Dispatchers } from '../util/dispatcher';
import { Badge } from '@material-ui/core';

export function ProjectsButton() {
    const dispatchers = useContext(Dispatchers);
    return (
        <GlobalState.Consumer>
            {state => (
                <FilterButton
                    icon={
                        <Badge
                            invisible={state.selectedProjects.length === 0}
                            color='secondary'
                            variant='dot'>
                            <TableChartIcon />
                        </Badge>
                    }
                    text='Projects'
                    entries={state.projects.map(project => ({
                        text: project,
                        selected: !!state.selectedProjects.find(
                            p => p === project
                        )
                    }))}
                    onChange={selectedEntry => {
                        dispatchers.state({
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
