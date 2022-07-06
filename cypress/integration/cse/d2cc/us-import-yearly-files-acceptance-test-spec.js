/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as gc from "../../../support/gridcapa-util";
import * as ftp from "../../../support/ftp-browser.js";
import * as minio from "../../../support/minio";

const URL = '/cse/import/d2cc'
const NTC = 'NTC';
const TASK_CREATION_TIMEOUT = 90000;

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

function checkTaskNotCreated(date, time) {
    gc.setDate(date)
    gc.setTime(time)
    gc.statusInTimestampViewShouldBe(gc.NOT_CREATED)
}

function checkNtcFileUploaded(date, time) {
    gc.setDate(date)
    gc.setTime(time)
    gc.fileShouldBeUploaded('2021_test_NTC_annual.xml', NTC, TASK_CREATION_TIMEOUT)
}

describe('NTC automatic import handling', () => {

    it('Triggers multiple task creation when NTC arrives', () => {
        gc.clearAndVisit(URL)
        gc.authenticate()

        gc.getTimestampView()
        checkTaskNotCreated('2021-01-01', '00:30')
        checkTaskNotCreated('2021-05-01', '01:30')
        checkTaskNotCreated('2021-07-03', '16:30')
        checkTaskNotCreated('2021-12-31', '23:30')

        ftp.uploadFile(ftp.CSE_IMPORT_D2CC, 'us-import-yearly-files/2021_test_NTC_annual.xml', ftp.NTC)

        cy.visit(URL)
        gc.getTimestampView()
        // Check that NTC file has been uploaded on tasks across the year
        checkNtcFileUploaded('2021-01-01', '00:30')
        checkNtcFileUploaded('2021-05-01', '01:30')
        checkNtcFileUploaded('2021-07-03', '16:30')
        checkNtcFileUploaded('2021-12-31', '23:30')
        // Check that NTC file upload has not created additional tasks
        checkTaskNotCreated('2020-12-31', '23:30')
        checkTaskNotCreated('2022-01-01', '00:30')

        minio.runOnMinio(() => {
            minio.deleteProcessFolder(minio.CSE_IMPORT_D2CC);
        })
        ftp.deleteProcessFolder(ftp.CSE_IMPORT_D2CC)
    });
})