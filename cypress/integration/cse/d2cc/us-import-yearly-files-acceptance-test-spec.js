/*
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
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
const WAIT_FOR_UPLOAD = 60000


Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('NTC automatic import handling', () => {
    it('Triggers one task creation when NTC arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        task.checkTaskNotCreated('2021-01-01', '00:30', ntc)
        task.checkTaskNotCreated('2021-05-01', '01:30', ntc)
        task.checkTaskNotCreated('2021-07-03', '16:30', ntc)
        task.checkTaskNotCreated('2021-12-31', '23:30', ntc)
        ftp.uploadOnFtp('us-import-yearly-files/2021_test_NTC_annual.xml', 'ntc')
        cy.wait(WAIT_FOR_UPLOAD)
        cy.visit('/cse/d2cc')
        task.checkTaskCreated('2021-01-01', '00:30', '2021_test_NTC_annual.xml', ntc)
        task.checkTaskCreated('2021-05-01', '01:30', '2021_test_NTC_annual.xml', ntc)
        task.checkTaskCreated('2021-07-03', '16:30', '2021_test_NTC_annual.xml', ntc)
        task.checkTaskCreated('2021-12-31', '23:30', '2021_test_NTC_annual.xml', ntc)
        task.checkTaskNotCreated('2020-12-31', '23:30', ntc)
        task.checkTaskNotCreated('2022-01-01', '01:30', ntc)
        ftp.deleteOnFtp('ntc/2021_test_NTC_annual.xml')
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFileFromMinio('/gridcapa/CSE/D2CC/NTC/', '2021_test_NTC_annual.xml')
        })
    });
})