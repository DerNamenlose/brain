import { IDispatchReceiver } from '../util/dispatcher';
import { Fragment } from 'react';
import React from 'react';
import { GlobalState } from '../model/GlobalState';
import { TaskList } from './TaskList';
import { somedayMaybeFilter } from '../util/Filter';

export function SomedayMaybe(props: IDispatchReceiver) {
    return (
        <GlobalState.Consumer>
            {state => (
                <Fragment>
                    <TaskList tasks={somedayMaybeFilter(state.tasks)} />
                </Fragment>
            )}
        </GlobalState.Consumer>
    );
}
