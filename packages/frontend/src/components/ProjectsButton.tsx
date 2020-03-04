import React, { useContext } from 'react';
import TableChartIcon from '@material-ui/icons/TableChart';
import { FilterButton } from './FilterButton';
import { GlobalState } from '../model/GlobalState';
import { IFilterAction, Dispatcher } from '../util/dispatcher';
import { Badge } from '@material-ui/core';

export function ProjectsButton() {
    const dispatch = useContext(Dispatcher);
    const state = useContext(GlobalState);
    return (
        <FilterButton
            icon={
                <Badge
                    invisible={state.config.selectedProjects.length === 0}
                    color='secondary'
                    variant='dot'>
                    <TableChartIcon />
                </Badge>
            }
            text='Projects'
            entries={state.projects.map(project => ({
                text: project,
                selected: !!state.config.selectedProjects.find(
                    p => p === project
                )
            }))}
            onChange={selectedEntry => {
                dispatch({
                    type: 'project',
                    subtype: selectedEntry.selected ? 'deselect' : 'select',
                    name: selectedEntry.text
                } as IFilterAction);
            }}
        />
    );
}
