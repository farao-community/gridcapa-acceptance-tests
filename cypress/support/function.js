/*
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const DEFAULT_FTP_UPLOAD_TIMEOUT_IN_S = 30;
const S_TO_MS_FACTOR = 1000;
const DEFAULT_FTP_UPLOAD_TIMEOUT_IN_MS = DEFAULT_FTP_UPLOAD_TIMEOUT_IN_S * S_TO_MS_FACTOR;

export function clearAndVisit(link) {
    cy.visit(link, {
        onBeforeLoad(win) {
            win.sessionStorage.clear()
        }
    })
}
export function authentication() {
    cy.get('button').click()
}
export function getTimestampView() {
    cy.get('[data-test=timestamp-view]').click()
}
export function setupDate(date) {
    cy.get('[data-test=timestamp-date-picker]').type(date)
}

export function setupTime(time) {
    cy.get('[data-test=timestamp-time-picker]').type(time)
}

export function timestampStatusShouldBe(timestampStatus) {
    cy.get('[data-test=timestamp-status]', {timeout: DEFAULT_FTP_UPLOAD_TIMEOUT_IN_MS}).should('have.text',timestampStatus)
}

export function inputDataShouldBe(expectedType, expectedStatus, expectedFilename, expectedLatestModification) {
    const timeoutProps = {timeout: DEFAULT_FTP_UPLOAD_TIMEOUT_IN_MS}
    cy.get('[data-test=' + expectedType + '-input-type]', timeoutProps).should('have.text',expectedType)
    cy.get('[data-test=' + expectedType + '-input-status]', timeoutProps).should('have.text',expectedStatus)
    if (expectedFilename) {
        cy.get('[data-test=' + expectedType + '-input-filename]', timeoutProps).should('have.text', expectedFilename)
    } else {
        cy.get('[data-test=' + expectedType + '-input-filename]', timeoutProps).should('be.empty')
    }
    /*if (expectedLatestModification) {

        const halfIntervalLengthInMs = DEFAULT_TIME_HALF_INTERVAL_FOR_PROXIMITY_CHECKS_IN_S * SECONDS_TO_MILLISECONDS
        let minDateTime = new Date(expectedLatestModification.getTime() - halfIntervalLengthInMs)
        let maxDateTime = new Date(expectedLatestModification.getTime() + halfIntervalLengthInMs)
        cy.get('[data-test=input-latest-modification]')
            .should('not.be.empty')
            .map(dateElt => Date.parse(dateElt.text()))
            .should('be.within', minDateTime, maxDateTime)


    } else {
        cy.get('[data-test=' + expectedType + '-input-latest-modification]', timeoutProps).should('be.empty')
    }*/
}
