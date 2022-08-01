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
const URL = '/cse/export/d2cc'
const DATE = '2022-01-28'
const TIME = '16:30'
const TIMEOUT = 60000;
Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
});


describe('Check CSE D2CC export corner runs correctly', () => {

    it('Check CSE D2CC export corner runs correctly', () => {

        gc.clearAndVisit(URL)
        gc.authenticate()
        gc.getBusinessDateView()
        gc.setDate(DATE)
        gc.paginationClickNextButton();
        gc.statusForTimestampShouldBe(gc.NOT_CREATED, TIMEOUT, Date.parse(DATE + 'T' + TIME))
               ftp.uploadFiles(
                    ftp.CSE_EXPORT_D2CC,
                    {
                        [ftp.CGM]: ['run-export/20220128_1630_155_Initial_CSE1_Transit_CSE.uct'],
                        [ftp.CRAC]: ['run-export/20220128_1630_145_CRAC_CO_CSE1_Transit_CSE.xml']
                    }
                )

        cy.visit(URL)
        gc.getBusinessDateView()
        gc.setDate(DATE)
        gc.paginationClickNextButton();
        // Automatic run on file arrival
        gc.statusForTimestampShouldBe(gc.RUNNING, TIMEOUT, Date.parse(DATE + 'T' + TIME))
        gc.statusForTimestampShouldBe(gc.SUCCESS, TIMEOUT, Date.parse(DATE + 'T' + TIME))
        gc.openFilesModalAndCheckStatusForImport(Date.parse(DATE + 'T' + TIME))
        gc.downloadAndCheckCGMFile(Date.parse(DATE + 'T' + TIME))
        minio.runOnMinio(() => {
            minio.deleteProcessFolder(minio.CSE_EXPORT_D2CC);
        });
        ftp.deleteProcessFolder(ftp.CSE_EXPORT_D2CC)
    })
})