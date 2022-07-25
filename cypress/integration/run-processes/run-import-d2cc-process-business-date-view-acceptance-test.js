/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as gc from "../../support/gridcapa-util";
import * as minio from "../../support/minio";
import * as ftp from "../../support/ftp-browser.js";


const minioUser = Cypress.env('GRIDCAPA_MINIO_USER');
const minioPassword = Cypress.env('GRIDCAPA_MINIO_PASSWORD')
const URL = '/cse/import/d2cc'
const DATE = '2021-09-01'
const TIME = '22:30'
const TIMEOUT = 60000;
Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
});


describe('Check CSE D2CC import corner runs correctly', () => {

    it('Check CSE D2CC import corner runs correctly', () => {

        gc.clearAndVisit(URL)
        gc.authenticate()
        gc.getBusinessDateView()
        gc.setDate(DATE)
        gc.paginationClickNextButton();
        gc.statusForTimestampShouldBe(gc.NOT_CREATED, TIMEOUT, Date.parse(DATE + 'T' + TIME))
        ftp.uploadFiles(
            ftp.CSE_IMPORT_D2CC,
            {
                [ftp.CGM]: ['grc-inputs-files-d2cc-process/20210901_2230_test_network.uct'],
                [ftp.GLSK]: ['grc-inputs-files-d2cc-process/20210901_2230_213_GSK_CO_CSE1.xml'],
                [ftp.CRAC]: ['grc-inputs-files-d2cc-process/20210901_2230_213_CRAC_CO_CSE1.xml'],
                [ftp.NTC]: ['grc-inputs-files-d2cc-process/2021_test_NTC_annual.xml'],
                [ftp.TARGET_CH]: ['grc-inputs-files-d2cc-process/20210101_target_ch_annual.xml'],
                [ftp.NTC_RED]: ['us-import-daily-files/20210901_2D3_NTC_reductions_test.xml']
            }
        )

        cy.visit(URL)
        gc.getBusinessDateView()
        gc.setDate(DATE)
        gc.paginationClickNextButton();
        gc.statusForTimestampShouldBe(gc.READY, TIMEOUT, Date.parse(DATE + 'T' + TIME))
        gc.runComputationForTimestamp(Date.parse(DATE + 'T' + TIME))
        gc.statusForTimestampShouldBe(gc.RUNNING, TIMEOUT, Date.parse(DATE + 'T' + TIME))
        gc.statusForTimestampShouldBe(gc.SUCCESS, TIMEOUT, Date.parse(DATE + 'T' + TIME))
        gc.openFilesModalAndCheckStatusForImport(Date.parse(DATE + 'T' + TIME))
        gc.downloadAndCheckCGMFile(Date.parse(DATE + 'T' + TIME))
        minio.runOnMinio(() => {
            minio.deleteProcessFolder(minio.CSE_IMPORT_D2CC);
        });
        ftp.deleteProcessFolder(ftp.CSE_IMPORT_D2CC)
    })
})