/*
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import crypto from "crypto";

require('cy-verify-downloads').addCustomCommand();

const GRIDCAPA_USER = Cypress.env('GRIDCAPA_USER');
const GRIDCAPA_PASSWORD = Cypress.env('GRIDCAPA_PASSWORD');
const FORMATTING_LOCAL = 'en-US';
const DEFAULT_FTP_UPLOAD_TIMEOUT_IN_S = 60;
const S_TO_MS_FACTOR = 1000;
const DEFAULT_FTP_UPLOAD_TIMEOUT_IN_MS = DEFAULT_FTP_UPLOAD_TIMEOUT_IN_S * S_TO_MS_FACTOR;

// Tasks and files status to be tested
export const NOT_CREATED = 'NOT_CREATED';
export const CREATED = 'CREATED';
export const VALIDATED = 'VALIDATED';
export const READY = 'READY';
export const RUNNING = 'RUNNING';
export const STOPPING = 'STOPPING';
export const INTERRUPTED = 'INTERRUPTED';
export const SUCCESS = 'SUCCESS';
export const ERROR = 'ERROR';

export function clearAndVisit(link) {
    cy.visit(link, {
        onBeforeLoad(win) {
            win.sessionStorage.clear()
        }
    })
}

export function authenticate() {
    cy.get('button').click()
    if (GRIDCAPA_USER) {
        cy.get('#username').type(GRIDCAPA_USER, { log: false })
        cy.get('#password').type(GRIDCAPA_PASSWORD, { log: false })
        cy.get('#kc-login').click()
    }
}

export function getTimestampView() {
    cy.get('[data-test=timestamp-view]').click()
}

export function getBusinessDateView() {
    cy.get('[data-test=business-view]').click()
}

export function setDate(date) {
    cy.get('[data-test=timestamp-date-picker]').type(date)
}

export function setTime(time) {
    cy.get('[data-test=timestamp-time-picker]').type(time)
}

export function getEvents() {
    cy.get('[data-test=events]').click()
}

export function interruptComputation() {
    cy.get('[data-test=stop-button]').click();
    cy.get('[data-test=yes-button]').click();
}

export function dateShouldBe(date) {
    cy.get('[data-test=timestamp-date-picker]').should('have.value', date)
}

export function timeShouldBe(time) {
    cy.get('[data-test=timestamp-time-picker]').should('have.value', time)
}

export function runComputationForTimestamp(timestamp) {
    cy.get('[data-test=run-button-'+ timestamp +']').click();
}

export function statusInTimestampViewShouldBe(timestampStatus, timeout = DEFAULT_FTP_UPLOAD_TIMEOUT_IN_MS) {
    cy.get('[data-test=timestamp-status]', {timeout: timeout}).should('have.text', timestampStatus)
}

export function statusForTimestampShouldBe(timestampStatus, timeout, timestamp) {
    cy.get('[data-test="timestamp-status-'+ timestamp +'"]', {timeout: timeout}).should('have.text', timestampStatus)
}

export function openFilesModal(timestamp) {
    cy.get('[data-test="timestamp-files-'+ timestamp +'"]').click()
}

export function downloadAndCheckFile(timestamp, fileType, fileName) {
    cy.get('[data-test="download-' + fileType + '-' + timestamp +'"]').click()
    cy.verifyDownload(fileName);
}

export function paginationClickNextButton(){
    cy.get('[aria-label="Next page"]').click();
}

export function runButtonForTimestampShouldBeDisabled(timestamp, timeout = DEFAULT_FTP_UPLOAD_TIMEOUT_IN_MS) {
    cy.get('[data-test=run-button-'+ timestamp +']', {timeout: timeout}).should('be.disabled')
}

export function runButtonForTimestampEnabled(timestamp, timeout = DEFAULT_FTP_UPLOAD_TIMEOUT_IN_MS) {
    cy.get('[data-test=run-button-'+ timestamp +']', {timeout: timeout}).should('not.be.disabled')
}

export function stopButtonShouldBeEnabled() {
    cy.get('[data-test=stop-button]').should('not.be.disabled')
}

export function stopButtonShouldBeDisabled() {
    cy.get('[data-test=stop-button]').should('be.disabled')
}

function inputDataShouldBe({expectedType, expectedStatus, expectedFilename, expectedLatestModification, timeout}={}) {
    const timeoutProps = {timeout: timeout}
    cy.get('[data-test=' + expectedType + '-input-type]', timeoutProps).should('have.text', expectedType)
    cy.get('[data-test=' + expectedType + '-input-status]', timeoutProps).should('have.text', expectedStatus)
    if (expectedFilename) {
        cy.get('[data-test=' + expectedType + '-input-filename]', timeoutProps).should('have.text', expectedFilename)
    } else {
        cy.get('[data-test=' + expectedType + '-input-filename]', timeoutProps).should('be.empty')
    }
    if (expectedLatestModification) {
        cy.get('[data-test=input-latest-modification]').should('not.be.empty')
    } else {
        cy.get('[data-test=' + expectedType + '-input-latest-modification]', timeoutProps).should('be.empty')
    }
}

export function eventShouldBe(expectedLevel, expectedMessage, timeout = DEFAULT_FTP_UPLOAD_TIMEOUT_IN_MS) {
    const timeoutProp = {timeout: timeout}
    cy.get('[data-test=' + sha256(expectedMessage) + '-process-event-level]', timeoutProp).should('have.text', expectedLevel)
    cy.get('[data-test=' + sha256(expectedMessage) + '-process-event-message]', timeoutProp).should('have.text', expectedMessage)
    cy.get('[data-test=' + sha256(expectedMessage) + '-process-event-timestamp]').should('not.be.empty')
}

export function fileShouldBeUploaded(filename, fileType, timeout = DEFAULT_FTP_UPLOAD_TIMEOUT_IN_MS) {
    inputDataShouldBe({
        expectedType : fileType,
        expectedStatus : VALIDATED,
        expectedFilename : filename,
        expectedLatestModification : true,
        timeout : timeout
    })
}

export function businessDateFilesShouldBeUploaded(filenameFormat, fileType, timeout = DEFAULT_FTP_UPLOAD_TIMEOUT_IN_MS) {
    for (let hour = 0; hour < 24; hour++) {
        let hourOnTwoDigits = hour.toLocaleString(FORMATTING_LOCAL, {minimumIntegerDigits: 2, useGrouping:false})
        setTime(hourOnTwoDigits + ':30')
        fileShouldBeUploaded(filenameFormat.format(hourOnTwoDigits), fileType, timeout)
    }
}

export function businessDateTasksStatusShouldBe(date, status, timeout = DEFAULT_FTP_UPLOAD_TIMEOUT_IN_MS) {
    for (let hour = 0; hour < 24; hour++) {
        if (hour === 12) { //By default there is a pagination 12 by 12
            paginationClickNextButton()
        }
        let hourOnTwoDigits = hour.toLocaleString(FORMATTING_LOCAL, {minimumIntegerDigits: 2, useGrouping:false})
        statusForTimestampShouldBe(status, timeout, Date.parse(date + 'T' + hourOnTwoDigits + ':30'))
    }
}

export function businessDateWithHoursTasksStatusShouldBe(date, hours, status, timeout = DEFAULT_FTP_UPLOAD_TIMEOUT_IN_MS) {
    for (const hour of hours) {
        let hourOnTwoDigits = Number(hour).toLocaleString(FORMATTING_LOCAL, {minimumIntegerDigits: 2, useGrouping:false})
        statusForTimestampShouldBe(status, timeout, Date.parse(date + 'T' + hourOnTwoDigits + ':30'))
    }
}

function sha256(param) {
    return crypto.createHash('sha256').update(param, 'utf8').digest('hex'); // UTF8 text hash
}

String.prototype.format = function() {
    let a = this;
    for (let k in arguments) {
        a = a.replace("{" + k + "}", arguments[k])
    }
    return a
}


