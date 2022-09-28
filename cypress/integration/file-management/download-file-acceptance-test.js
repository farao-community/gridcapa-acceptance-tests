/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as gc from "../../support/gridcapa-util";
import * as minio from "../../support/minio";
import * as ftp from "../../support/ftp-browser.js";

const URL = '/cse/export/d2cc'
const DATE = '2022-01-28'
const TIME = '16:30'
const TIMEOUT = 60000;

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
});

describe('Check files can be downloaded from application', () => {

    it('Upload files', () => {
        ftp.uploadFiles(
            ftp.CSE_EXPORT_D2CC,
            {
                [ftp.CGM]: ['run-export/20220128_1630_155_Initial_CSE1_Transit_CSE.uct'],
                [ftp.CRAC]: ['run-export/20220128_1630_145_CRAC_CO_CSE1_Transit_CSE.xml']
            }
        )
    })

    it('Check CGM can be downloaded from TS view', () => {
        gc.clearAndVisit(URL)
        gc.authenticate()
        gc.getTimestampView()
        gc.setDate(DATE)
        gc.setTime(TIME)
        gc.statusInTimestampViewShouldBe(gc.SUCCESS, TIMEOUT)

        gc.downloadAndCheckFile(Date.parse(DATE + 'T' + TIME), 'CGM', '20220128_1630_155_Initial_CSE1_Transit_CSE.uct')
    })

    it('Check CGM can be downloaded from BD view', () => {
        gc.clearAndVisit(URL)
        gc.authenticate()
        gc.getBusinessDateView()
        gc.setDate(DATE)
        gc.paginationClickNextButton()
        gc.statusForTimestampShouldBe(gc.SUCCESS, TIMEOUT, Date.parse(DATE + 'T' + TIME))

        gc.openFilesModal(Date.parse(DATE + 'T' + TIME))
        gc.downloadAndCheckFile(Date.parse(DATE + 'T' + TIME), 'CGM', '20220128_1630_155_Initial_CSE1_Transit_CSE.uct')
    })

    it('Clean files', () => {
        minio.runOnMinio(() => {
            minio.deleteProcessFolder(minio.CSE_EXPORT_D2CC);
        });
        ftp.deleteProcessFolder(ftp.CSE_EXPORT_D2CC)
    })
})