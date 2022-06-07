/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as gc from "../../../support/function";
import * as ftp from "../../../support/ftp-browser.js";
import * as minio from "../../../support/minio";
import * as task from "../../../support/task";

const minioUser = Cypress.env('GRIDCAPA_MINIO_USER');
const minioPassword = Cypress.env('GRIDCAPA_MINIO_PASSWORD')
const ntc = 'NTC';
const TASK_CREATION_TIMEOUT = 90000;

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

function checkTaskNotCreated(date, time) {
    task.checkTaskNotCreated(date, time, ntc)
}

function checkTaskCreated(date, time, filename, timeout = null) {
    task.checkTaskCreated(date, time, filename, ntc, timeout)
}

describe('NTC automatic import handling', () => {
    it('Triggers multiple task creation when NTC arrives', () => {
        gc.clearAndVisit('/cse/import/d2cc')
        gc.authentication()
        checkTaskNotCreated('2021-01-01', '00:30')
        checkTaskNotCreated('2021-05-01', '01:30')
        checkTaskNotCreated('2021-07-03', '16:30')
        checkTaskNotCreated('2021-12-31', '23:30')
        ftp.uploadOnFtp('CSE_D2CC', 'us-import-yearly-files/2021_test_NTC_annual.xml', 'ntc')
        cy.visit('/cse/import/d2cc')
        checkTaskCreated('2021-01-01', '00:30', '2021_test_NTC_annual.xml', TASK_CREATION_TIMEOUT)
        checkTaskCreated('2021-05-01', '01:30', '2021_test_NTC_annual.xml')
        checkTaskCreated('2021-07-03', '16:30', '2021_test_NTC_annual.xml')
        checkTaskCreated('2021-12-31', '23:30', '2021_test_NTC_annual.xml')
        checkTaskNotCreated('2020-12-31', '23:30')
        checkTaskNotCreated('2022-01-01', '00:30')
        ftp.deleteOnFtp('CSE_D2CC', 'ntc/2021_test_NTC_annual.xml')
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFileFromMinio('/gridcapa/CSE/IMPORT/D2CC/NTC/', '2021_test_NTC_annual.xml')
        })
    });
})