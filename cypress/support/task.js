/*
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as gc from "./function";

const formattingLocal = 'en-US';
const notCreated = 'NOT_CREATED';
const created = 'CREATED';
const notPresent = 'NOT_PRESENT';
const validated = 'VALIDATED';

String.prototype.format = function() {
    let a = this;
    for (let k in arguments) {
        a = a.replace("{" + k + "}", arguments[k])
    }
    return a
}

export function checkTaskNotCreated(date, time, fileType) {
    gc.getTimestampView();
    gc.setupDate(date);
    gc.setupTime(time);
    gc.timestampStatusShouldBe(notCreated);
    gc.inputDataShouldBe(fileType, notPresent);
}

export function checkTasksNotCreated(date, fileType) {
    gc.getTimestampView()
    gc.setupDate(date)
    for (let hour = 0; hour < 24; hour++) {
        let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
        gc.setupTime(hourOnTwoDigits + ':30')
        gc.timestampStatusShouldBe(notCreated)
        gc.inputDataShouldBe(fileType, notPresent)
    }
}

export function checkTaskCreated(date, time, filename, fileType) {
    gc.getTimestampView()
    gc.setupDate(date)
    gc.setupTime(time)
    gc.timestampStatusShouldBe(created)
    gc.inputDataShouldBe(fileType, validated, filename, true)
}

export function checkTasksCreated(date, filenameFormat, fileType) {
    gc.getTimestampView()
    gc.setupDate(date)
    for (let hour = 0; hour < 24; hour++) {
        let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
        gc.setupTime(hourOnTwoDigits + ':30')
        gc.timestampStatusShouldBe(created)
        gc.inputDataShouldBe(fileType, validated, filenameFormat.format(hourOnTwoDigits), true)
    }
}

export function checkTasksCreatedWhenDailyFileUploaded(date, filename, fileType) {
    gc.getTimestampView()
    gc.setupDate(date)
    for (let hour = 0; hour < 24; hour++) {
        let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
        gc.setupTime(hourOnTwoDigits + ':30')
        gc.timestampStatusShouldBe(created)
        gc.inputDataShouldBe(fileType, validated, filename, true)
    }
}