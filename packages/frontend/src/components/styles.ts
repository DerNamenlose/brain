import { makeStyles, createStyles } from '@material-ui/core';

export const useStyles = makeStyles(theme =>
    createStyles({
        button: {
            width: theme.spacing(7),
            height: theme.spacing(7)
        },
        buttonIcon: {
            fontSize: theme.spacing(4),
            color: 'white'
        },
        buttonText: {
            fontSize: theme.spacing(1.5),
            margin: 0
        }
    })
);
