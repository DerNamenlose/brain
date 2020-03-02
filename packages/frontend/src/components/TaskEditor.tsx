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
import { orange } from '@material-ui/core/colors';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import { ResponsiveButton } from './ResponsiveButton';
import { useHistory } from 'react-router-dom';
import ReactSelectMaterialUi from 'react-select-material-ui';
import { copyAndUpdate } from '../util/copyUpdater';
import { sortAndUniqueString } from '../util/order';
import { ValidationResult } from '../util/ValidationResult';
import { ITaskAction, Dispatcher } from '../util/dispatcher';
import { GlobalState } from '../model/GlobalState';
import { FinishPostponeDelegateButtons } from './FinishPostponeDelegateButtons';
import { StartDueButtons } from './StartDueButtons';

const useStyles = makeStyles(theme =>
    createStyles({
        buttonGroup: {
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            display: 'flex',
            backgroundColor: theme.palette.background.default
        },
        button: {
            flexGrow: 1,
            height: theme.spacing(5)
        },
        formBody: {
            marginBottom: theme.spacing(6),
            padding: theme.spacing(3)
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
                    <h1
                        style={{
                            marginBottom: '0.25rem'
                        }}>
                        {props.isNew ? 'Create' : 'Edit'} task
                    </h1>
                    {validation.hasAnyError() && (
                        <Paper className={classes.error}>
                            Could not save task.
                        </Paper>
                    )}
                    <FormControl>
                        <div className={classes.formBody}>
                            <FormControl
                                required
                                fullWidth
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
                            <FormControl fullWidth>
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
                            <FormControl fullWidth>
                                <FinishPostponeDelegateButtons
                                    isPostponed={editedTask.postponed}
                                    isDone={editedTask.done}
                                    delegatedTo={editedTask.delegatedTo}
                                    onDoneChange={() =>
                                        setEditedTask({
                                            ...editedTask,
                                            done: !editedTask.done
                                        })
                                    }
                                    onPostponedChange={() =>
                                        setEditedTask({
                                            ...editedTask,
                                            postponed: !editedTask.postponed
                                        })
                                    }
                                    onDelegateChange={() => {
                                        setEditedTask({
                                            ...editedTask,
                                            delegatedTo: !!editedTask.delegatedTo
                                                ? undefined
                                                : 'someone'
                                        });
                                    }}
                                />
                            </FormControl>
                            <ReactSelectMaterialUi
                                label='Contexts'
                                options={sortAndUniqueString(
                                    state.contexts.concat(
                                        editedTask.contexts || []
                                    )
                                )}
                                SelectProps={{
                                    isCreatable: true,
                                    isMulti: true
                                }}
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
                                    state.projects.concat(
                                        editedTask.projects || []
                                    )
                                )}
                                SelectProps={{
                                    isCreatable: true,
                                    isMulti: true
                                }}
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
                                SelectProps={{
                                    isCreatable: true,
                                    isMulti: true
                                }}
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
                            <FormControl fullWidth>
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
                            </FormControl>
                            <FormControl>
                                <InputLabel htmlFor='priority'>
                                    Priority
                                </InputLabel>
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
                        </div>
                        <ButtonGroup className={classes.buttonGroup}>
                            <ResponsiveButton
                                icon={<SaveIcon />}
                                extended='Save'
                                color='primary'
                                variant='outlined'
                                aria-label='Save'
                                className={classes.button}
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
                            <SkipButton
                                icon={<SkipNextIcon />}
                                extended='Skip task'
                                color='primary'
                                variant='contained'
                                aria-label='Skip task'
                                className={classes.button}
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
                                variant='outlined'
                                aria-label='Cancel'
                                className={classes.button}
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
