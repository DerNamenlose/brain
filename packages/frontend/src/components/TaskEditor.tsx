import { Task } from 'brain-common';
import { Fragment, useState, useContext } from 'react';
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
    Paper,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    Typography
} from '@material-ui/core';
import { green, orange, yellow } from '@material-ui/core/colors';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import AllInclusiveIcon from '@material-ui/icons/AllInclusive';
import PlayIcon from '@material-ui/icons/PlayArrow';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import { ResponsiveButton } from './ResponsiveButton';
import { useHistory } from 'react-router-dom';
import ReactSelectMaterialUi from 'react-select-material-ui';
import { copyAndUpdate } from '../util/copyUpdater';
import { sortAndUniqueString } from '../util/order';
import { ValidationResult } from '../util/ValidationResult';
import { ITaskAction, Dispatcher } from '../util/dispatcher';
import { GlobalState } from '../model/GlobalState';
import { StartDueButtons } from './StartDueButtons';

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

const SkipButton = withStyles({
    root: {
        backgroundColor: orange[500]
    }
})(ResponsiveButton);

const PostponeButton = withStyles({
    root: {
        backgroundColor: yellow[500]
    }
})(ResponsiveButton);

function ActivationDialog(props: {
    open: boolean;
    onClose: (answer: boolean) => void;
}) {
    return (
        <Dialog open={props.open} aria-labelledby='dialog-title'>
            <DialogTitle id='dialog-title'>Activate task?</DialogTitle>
            <Typography>
                This task is currently postponed and will only be visible in
                Someday/Maybe. Activate it?
            </Typography>
            <Button onClick={() => props.onClose(true)}>Activate</Button>
            <Button onClick={() => props.onClose(false)}>
                Leave postponed
            </Button>
        </Dialog>
    );
}

export interface TaskEditorProps {
    task: Task;
    isNew?: boolean;
    onClose?: (abort: boolean) => void;
    canSkip?: boolean; // does the editor have skip button (i.e. it's running in the context of the inbox processing assistent)
}

export interface TaskEditorControlProps {
    task: Task;
    isNew?: boolean;
    onSave?: (newState: Task) => void;
    onPostpone?: (newState: Task) => void;
    onCancel?: () => void;
    onSkip?: () => void;
    canSkip?: boolean; // does the editor have skip button (i.e. it's running in the context of the inbox processing assistent)
}

function validate(task: Task): ValidationResult {
    const result = new ValidationResult();
    if (!task.title || task.title === '') {
        result.addError('title', 'Task title is required');
    }
    return result;
}

function StateButton(props: { task: Task; onClick: () => void }) {
    const StyledButton = withStyles(theme => ({
        root: {
            backgroundColor: props.task.done
                ? theme.palette.grey[500]
                : green[500],
            '& .stateText': {
                textDecoration: props.task.done ? 'line-through' : 'none'
            },
            margin: theme.spacing(1)
        }
    }))(Button);
    return (
        <StyledButton
            variant='contained'
            color='primary'
            onClick={props.onClick}>
            <span className='stateText'>
                Task is {props.task.done ? 'done. ' : 'open. '}
            </span>
            <span>{props.task.done ? 'Reopen?' : 'Finish?'}</span>
        </StyledButton>
    );
}

export function TaskEditorControl(props: TaskEditorControlProps) {
    const classes = useStyles();
    const [editedTask, setEditedTask] = useState({ ...props.task });
    const [validation, setValidation] = useState<ValidationResult>(
        new ValidationResult()
    );
    const [activationRequest, setActivationRequest] = useState(false);
    const handleChange = (name: keyof Task) => {
        return (ev: React.ChangeEvent<HTMLInputElement>) => {
            setEditedTask(copyAndUpdate(editedTask, name, ev.target.value));
        };
    };

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
                            task={editedTask}
                            onClick={() =>
                                setEditedTask({
                                    ...editedTask,
                                    done: !editedTask.done
                                })
                            }
                        />
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
                            style={{
                                zIndex: 'unset'
                            }}
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
                            style={{
                                zIndex: 'unset'
                            }}
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
                            style={{
                                zIndex: 'unset'
                            }}
                        />
                        <StartDueButtons
                            due={
                                !!editedTask.due
                                    ? new Date(editedTask.due)
                                    : undefined
                            }
                            start={
                                !!editedTask.start
                                    ? new Date(editedTask.start)
                                    : undefined
                                }
                            onDueChange={newDate => {
                                    const nv = copyAndUpdate(
                                        editedTask,
                                    'due',
                                    newDate && newDate.getTime()
                                    );
                                    setEditedTask(nv);
                                }}
                            onStartChange={newDate => {
                                    const nv = copyAndUpdate(
                                        editedTask,
                                    'start',
                                    newDate && newDate.getTime()
                                    );
                                    setEditedTask(nv);
                                }}
                            />
                        <FormControl>
                            <InputLabel htmlFor='priority'>Priority</InputLabel>
                            <Select
                                id='priority'
                                value={editedTask.priority || ' '}
                                onChange={ev =>
                                    setEditedTask(
                                        copyAndUpdate(
                                            editedTask,
                                            'priority',
                                            ev.target.value === ' '
                                                ? undefined
                                                : ev.target.value
                                        )
                                    )
                                }>
                                <MenuItem value={' '}>[None]</MenuItem>
                                <MenuItem value={'A'}>A</MenuItem>
                                <MenuItem value={'B'}>B</MenuItem>
                                <MenuItem value={'C'}>C</MenuItem>
                                <MenuItem value={'D'}>D</MenuItem>
                                <MenuItem value={'E'}>E</MenuItem>
                                <MenuItem value={'F'}>F</MenuItem>
                            </Select>
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
                                        props.onSave &&
                                            props.onSave(editedTask);
                                    }
                                }}
                            />
                            <PostponeButton
                                icon={
                                    !!editedTask.postponed ? (
                                        <PlayIcon />
                                    ) : (
                                        <AllInclusiveIcon />
                                    )
                                }
                                extended={
                                    !!editedTask.postponed
                                        ? 'Activate'
                                        : 'Postpone'
                                }
                                color='primary'
                                variant='contained'
                                aria-label={
                                    !!editedTask.postponed
                                        ? 'Activate'
                                        : 'Postpone'
                                }
                                onClick={() => {
                                    const res = validate(editedTask);
                                    if (res.hasAnyError()) {
                                        setValidation(res);
                                    } else {
                                        props.onPostpone &&
                                            props.onPostpone(editedTask);
                                    }
                                }}
                            />
                            <SkipButton
                                icon={<SkipNextIcon />}
                                extended='Skip task'
                                color='primary'
                                variant='contained'
                                aria-label='Skip task'
                                onClick={() => {
                                    props.onSkip && props.onSkip();
                                }}
                                style={{
                                    display: props.canSkip
                                        ? 'inline-block'
                                        : 'none'
                                }}
                            />
                            <ResponsiveButton
                                icon={<CancelIcon />}
                                extended='Cancel'
                                color='secondary'
                                variant='contained'
                                aria-label='Cancel'
                                onClick={() =>
                                    props.onCancel && props.onCancel()
                                }
                            />
                        </ButtonGroup>
                    </FormControl>
                    <ActivationDialog
                        open={activationRequest}
                        onClose={activate => {
                            if (activate) {
                                editedTask.postponed = false;
                            }
                            props.onSave && props.onSave(editedTask);
                            setActivationRequest(false);
                        }}
                    />
                </Fragment>
            )}
        </GlobalState.Consumer>
    );
}

export function TaskEditor(props: TaskEditorProps) {
    const history = useHistory();
    const dispatch = useContext(Dispatcher);

    const handlePostpone = (newState: Task) => {
        newState.postponed = !newState.postponed;
        dispatch({
            type: 'task',
            subtype: props.isNew ? 'create' : 'update',
            task: newState
        } as ITaskAction);
        history.goBack();
    };

    const handleSave = (newState: Task) => {
        dispatch({
            type: 'task',
            subtype: props.isNew ? 'create' : 'update',
            task: newState
        } as ITaskAction);
        history.goBack();
    };

    return (
        <TaskEditorControl
            task={props.task}
            isNew={props.isNew}
            onSave={handleSave}
            onCancel={() => history.goBack()}
            onPostpone={handlePostpone}
        />
    );
}
