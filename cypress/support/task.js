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

const timeoutProps = {timeout: 10000}
const DEFAULT_FTP_UPLOAD_TIMEOUT_IN_S = 60;
const S_TO_MS_FACTOR = 1000;
const DEFAULT_FTP_UPLOAD_TIMEOUT_IN_MS = DEFAULT_FTP_UPLOAD_TIMEOUT_IN_S * S_TO_MS_FACTOR;

String.prototype.format = function() {
    let a = this;
    for (let k in arguments) {
        a = a.replace("{" + k + "}", arguments[k])
    }
    return a
}

export function checkTaskNotCreated(date, time, fileType, timeout = DEFAULT_FTP_UPLOAD_TIMEOUT_IN_MS) {
    gc.getTimestampView();
    gc.setupDate(date);
    gc.setupTime(time);
    gc.timestampStatusShouldBe(notCreated, timeout);
    gc.inputDataShouldBe({
        expectedType : fileType,
        expectedStatus : notPresent,
        timeout : timeout
    });
}

export function checkTasksNotCreated(date, fileType, timeout = DEFAULT_FTP_UPLOAD_TIMEOUT_IN_MS) {
    gc.getTimestampView()
    gc.setupDate(date)
    for (let hour = 0; hour < 24; hour++) {
        let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
        gc.setupTime(hourOnTwoDigits + ':30')
        gc.timestampStatusShouldBe(notCreated, timeout)
        gc.inputDataShouldBe({
            expectedType : fileType,
            expectedStatus : notPresent,
            timeout : timeout
        })
    }
}

export function checkTaskCreated(date, time, filename, fileType, timeout = DEFAULT_FTP_UPLOAD_TIMEOUT_IN_MS) {
    gc.getTimestampView()
    gc.setupDate(date)
    gc.setupTime(time)
    gc.timestampStatusShouldBe(created, timeout)
    gc.inputDataShouldBe({
        expectedType : fileType,
        expectedStatus : validated,
        expectedFilename : filename,
        expectedLatestModification : true,
        timeout : timeout
    })
}

export function checkTasksCreated(date, filenameFormat, fileType, timeout = DEFAULT_FTP_UPLOAD_TIMEOUT_IN_MS) {
    gc.getTimestampView()
    gc.setupDate(date)
    for (let hour = 0; hour < 24; hour++) {
        let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
        gc.setupTime(hourOnTwoDigits + ':30')
        gc.timestampStatusShouldBe(created, timeout)
        gc.inputDataShouldBe({
            expectedType : fileType,
            expectedStatus : validated,
            expectedFilename : filenameFormat.format(hourOnTwoDigits),
            expectedLatestModification : true,
            timeout : timeout
        })
    }
}

export function checkTasksCreatedWhenDailyFileUploaded(date, filename, fileType, timeout = DEFAULT_FTP_UPLOAD_TIMEOUT_IN_MS) {
    gc.getTimestampView()
    gc.setupDate(date)
    for (let hour = 0; hour < 24; hour++) {
        let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
        gc.setupTime(hourOnTwoDigits + ':30')
        gc.timestampStatusShouldBe(created, timeout)
        gc.inputDataShouldBe({
            expectedType : fileType,
            expectedStatus : validated,
            expectedFilename : filename,
            expectedLatestModification : true,
            timeout : timeout
        })
    }
}

export function checkTasksNotCreatedInBusinessDateView(date) {
    gc.getBusinessDateView()
    gc.setupDate(date)
    for (let hour = 0; hour < 24; hour++) {
        let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping: false})
        let timestamp = date + "  " + hourOnTwoDigits + ':30'
        cy.get('[data-test="' + timestamp +'-task-status"]', timeoutProps).should('have.text', 'NOT_CREATED')
    }
}

export function checkTaskStatusInBusinessDateViewShouldBe(date, time, expectedStatus) {
    gc.getBusinessDateView()
    gc.setupDate(date)
    let timestamp = date + "  " + time
    cy.get('[data-test="' + timestamp + '-task-status"]', timeoutProps).should('have.text', expectedStatus)

}

