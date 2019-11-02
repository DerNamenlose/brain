import { IDispatchReceiver } from '../util/dispatcher';
import { Fragment } from 'react';
import React from 'react';
import { GlobalState } from '../model/GlobalState';
import { TaskList } from './TaskList';
import { inboxFilter } from '../util/Filter';

export function Inbox(props: IDispatchReceiver) {
    return (
        <GlobalState.Consumer>
            {state => (
                <Fragment>
                    <TaskList tasks={inboxFilter(state.tasks)} />
                </Fragment>
            )}
        </GlobalState.Consumer>
    );
}
