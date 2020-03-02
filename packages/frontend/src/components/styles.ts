import { makeStyles, createStyles } from '@material-ui/core';

export const useStyles = makeStyles(theme =>
    createStyles({
        buttonIcon: {
            fontSize: theme.spacing(4),
            color: 'white'
        }
    })
);
