import { Task } from '../model/Task';
import { Fragment, useState } from 'react';
import React from 'react';
import {
    Input,
    InputLabel,
    FormControl,
    Button,
    ButtonGroup,
    makeStyles,
    createStyles,
    withStyles,
    FormHelperText,
    Paper
} from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import { ResponsiveButton } from './ResponsiveButton';
import { useHistory } from 'react-router-dom';
import ReactSelectMaterialUi from 'react-select-material-ui';
import { copyAndUpdate } from '../util/copyUpdater';
import { sortAndUniqueString } from '../util/order';
import { ValidationResult } from '../util/ValidationResult';
import { IDispatchReceiver, ITaskAction } from '../util/dispatcher';
import { GlobalState } from '../model/GlobalState';

const useStyles = makeStyles(theme =>
    createStyles({
        buttons: {
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: theme.spacing(2)
        },
        error: {
            backgroundColor: theme.palette.error.main,
            color: theme.palette.error.contrastText,
            margin: 'auto',
            padding: theme.spacing(1)
        }
    })
);

export interface TaskEditorProps {
    task: Task;
    isNew?: boolean;
}

function validate(task: Task): ValidationResult {
    const result = new ValidationResult();
    if (!task.title || task.title === '') {
        result.addError('title', 'Task title is required');
    }
    return result;
}

export function TaskEditor(props: TaskEditorProps & IDispatchReceiver) {
    const classes = useStyles();
    const history = useHistory();
    const [editedTask, setEditedTask] = useState({ ...props.task });
    const [validation, setValidation] = useState<ValidationResult>(
        new ValidationResult()
    );

    const handleChange = (name: keyof Task) => {
        return (ev: React.ChangeEvent<HTMLInputElement>) => {
            setEditedTask(copyAndUpdate(editedTask, name, ev.target.value));
        };
    };

    const StateButton = withStyles(theme => ({
        root: {
            backgroundColor: editedTask.done
                ? theme.palette.grey[500]
                : green[500],
            '& .stateText': {
                textDecoration: editedTask.done ? 'line-through' : 'none'
            },
            margin: theme.spacing(1)
        }
    }))(Button);

    return (
        <GlobalState.Consumer>
            {state => (
                <Fragment>
                    <h1>{props.isNew ? 'Create' : 'Edit'} task</h1>
                    {validation.hasAnyError() && (
                        <Paper className={classes.error}>
                            Could not save task.
                        </Paper>
                    )}
                    <FormControl>
                        <FormControl
                            required
                            error={validation.hasError('title')}>
                            <InputLabel htmlFor='title'>Title</InputLabel>
                            <Input
                                id='title'
                                placeholder='Task title'
                                value={editedTask.title || ''}
                                onChange={handleChange('title')}
                            />
                            {validation.hasError('title') && (
                                <FormHelperText>
                                    {validation.error('title')}
                                </FormHelperText>
                            )}
                        </FormControl>
                        <StateButton
                            variant='contained'
                            color='primary'
                            onClick={() =>
                                setEditedTask({
                                    ...editedTask,
                                    done: !editedTask.done
                                })
                            }>
                            <span className='stateText'>
                                Task is {editedTask.done ? 'done. ' : 'open. '}
                            </span>
                            <span>
                                {editedTask.done ? 'Reopen?' : 'Finish?'}
                            </span>
                        </StateButton>
                        <FormControl>
                            <InputLabel htmlFor='Description'>
                                Description
                            </InputLabel>
                            <Input
                                id='description'
                                multiline
                                value={editedTask.description || ''}
                                placeholder='Description'
                                onChange={handleChange('description')}
                            />
                        </FormControl>
                        <ReactSelectMaterialUi
                            label='Contexts'
                            options={sortAndUniqueString(
                                state.contexts.concat(editedTask.contexts || [])
                            )}
                            SelectProps={{ isCreatable: true, isMulti: true }}
                            fullWidth={true}
                            onChange={(newValue: any) => {
                                const nv = copyAndUpdate(
                                    editedTask,
                                    'contexts',
                                    newValue
                                );
                                setEditedTask(nv);
                            }}
                            values={editedTask.contexts}
                        />
                        <ReactSelectMaterialUi
                            label='Projects'
                            options={sortAndUniqueString(
                                state.projects.concat(editedTask.projects || [])
                            )}
                            SelectProps={{ isCreatable: true, isMulti: true }}
                            fullWidth={true}
                            onChange={(newValue: any) => {
                                const nv = copyAndUpdate(
                                    editedTask,
                                    'projects',
                                    newValue
                                );
                                setEditedTask(nv);
                            }}
                            values={editedTask.projects}
                        />
                        <ReactSelectMaterialUi
                            label='Tags'
                            options={sortAndUniqueString(
                                state.tags.concat(editedTask.tags || [])
                            )}
                            SelectProps={{ isCreatable: true, isMulti: true }}
                            fullWidth={true}
                            onChange={(newValue: any) => {
                                const nv = copyAndUpdate(
                                    editedTask,
                                    'tags',
                                    newValue
                                );
                                setEditedTask(nv);
                            }}
                            values={editedTask.tags}
                        />
                        <FormControl>
                            Due:
                            <input
                                type='date'
                                value={
                                    (editedTask.due &&
                                        editedTask.due
                                            .toISOString()
                                            .slice(0, 10)) ||
                                    ''
                                }
                                onChange={ev => {
                                    const nv = copyAndUpdate(
                                        editedTask,
                                        'due',
                                        ev.target.valueAsDate
                                    );
                                    setEditedTask(nv);
                                }}
                            />
                        </FormControl>
                        <ButtonGroup className={classes.buttons}>
                            <ResponsiveButton
                                icon={<SaveIcon />}
                                extended='Save'
                                color='primary'
                                variant='contained'
                                aria-label='Save'
                                onClick={() => {
                                    const res = validate(editedTask);
                                    if (res.hasAnyError()) {
                                        setValidation(res);
                                    } else {
                                        props.dispatch({
                                            type: 'task',
                                            subtype: props.isNew
                                                ? 'create'
                                                : 'update',
                                            task: editedTask
                                        } as ITaskAction);
                                        history.goBack();
                                    }
                                }}
                            />
                            <ResponsiveButton
                                icon={<CancelIcon />}
                                extended='Cancel'
                                color='secondary'
                                variant='contained'
                                aria-label='Cancel'
                                onClick={() => history.goBack()}
                            />
                        </ButtonGroup>
                    </FormControl>
                </Fragment>
            )}
        </GlobalState.Consumer>
    );
}
