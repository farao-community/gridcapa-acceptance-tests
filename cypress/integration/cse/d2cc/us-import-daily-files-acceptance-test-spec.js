/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as gc from "../../../support/gridcapa-util";
import * as minio from "../../../support/minio";
import * as ftp from "../../../support/ftp-browser.js";

const URL = '/cse/import/d2cc'
const DATE = '2021-09-01'

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('NTCRED automatic import handling', () => {

    it('Triggers 24 tasks creation when NTCRED arrives', () => {
        gc.clearAndVisit(URL)
        gc.authenticate()
        gc.getBusinessDateView()
        gc.setDate(DATE)
        gc.businessDateTasksStatusShouldBe(DATE, gc.NOT_CREATED)

        ftp.uploadFile(ftp.CSE_IMPORT_D2CC, 'us-import-daily-files/20210901_2D3_NTC_reductions_test.xml', ftp.NTC_RED)

        cy.visit(URL)
        gc.getBusinessDateView()
        gc.setDate(DATE)
        gc.businessDateTasksStatusShouldBe(DATE, gc.CREATED)

        minio.runOnMinio(() => {
            minio.deleteProcessFolder(minio.CSE_IMPORT_D2CC);
        })
        ftp.deleteProcessFolder(ftp.CSE_IMPORT_D2CC)
    });
})