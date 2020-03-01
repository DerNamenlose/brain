import React from 'react';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { Dialog, Button } from '@material-ui/core';
import enGB from 'date-fns/locale/en-GB';
import enUS from 'date-fns/locale/en-US';
import de from 'date-fns/locale/de';
import fr from 'date-fns/locale/fr';

const localeMap: Map<string, any> = new Map();
localeMap.set('en-GB', enGB);
localeMap.set('en-US', enUS);
localeMap.set('en', enGB);
localeMap.set('de', de);
localeMap.set('fr', fr);

const bestMatchingLocale =
    window.navigator.languages.find(locale => localeMap.has(locale)) || 'en'; // navigator languages are probably fixed during runtime

export function ClearableDatePicker(props: {
    onChange: (newDate: Date | undefined) => void;
    onClose?: () => void;
    open?: boolean;
    date?: Date;
}) {
    return (
        <Dialog open={!!props.open} onClose={props.onClose}>
            <MuiPickersUtilsProvider
                utils={DateFnsUtils}
                locale={localeMap.get(bestMatchingLocale)}>
                <DatePicker
                    value={props.date}
                    variant='static'
                    onChange={newDate =>
                        props.onChange(
                            new Date(newDate?.getTime() || new Date())
                        )
                    }
                />
            </MuiPickersUtilsProvider>
            <Button onClick={() => props.onChange(undefined)}>Clear</Button>
        </Dialog>
    );
}
