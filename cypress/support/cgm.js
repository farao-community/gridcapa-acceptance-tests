import * as gc from "./function";

const formattingLocal = 'en-US';
const cgm = 'CGM';
const notCreated = 'NOT_CREATED';
const created = 'CREATED';
const notPresent = 'NOT_PRESENT';
const validated = 'VALIDATED';

export function checkUnloadedCgm(date, time) {
    gc.getTimestampView();
    gc.setupDate(date);
    gc.setupTime(time);
    gc.timestampStatusShouldBe(notCreated);
    gc.inputDataShouldBe(cgm, notPresent, null, null);
}

export function checkUnloadedCgmsOnBD(date) {
    gc.getTimestampView()
    gc.setupDate(date)
    for (let hour = 0; hour < 24; hour++) {
        let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
        gc.setupTime(hourOnTwoDigits + ':30')
        gc.timestampStatusShouldBe(notCreated)
        gc.inputDataShouldBe(cgm, notPresent, null, null)
    }
}

export function checkLoadedCgm(date, time, filename) {
    gc.getTimestampView()
    gc.setupDate(date)
    gc.setupTime(time)
    gc.timestampStatusShouldBe(created)
    gc.inputDataShouldBe(cgm, validated, filename, '')
}

export function checkLoadedCgmsOnBD(date, filenameFormat) {
    gc.getTimestampView()
    gc.setupDate(date)
    for (let hour = 0; hour < 24; hour++) {
        let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
        gc.setupTime(hourOnTwoDigits + ':30')
        gc.timestampStatusShouldBe(created)
        gc.inputDataShouldBe(cgm, validated, filenameFormat.format(hourOnTwoDigits), '')
    }
}