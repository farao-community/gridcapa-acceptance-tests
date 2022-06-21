/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as gc from "../../support/function";
import * as minio from "../../support/minio";
import * as ftp from "../../support/ftp-browser.js";

const URL = '/cse/import/d2cc'
const DATE = '2021-09-01'
const TIME = '22:30'
const TIMEOUT_UPLOAD = 120000
const TIMEOUT = 60000

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('Check CSE D2CC import corner runs correctly', () => {

    it('Check CSE D2CC import corner runs correctly', () => {
        gc.clearAndVisit(URL)
        gc.authenticate()

        gc.getTimestampView()
        gc.setDate(DATE)
        gc.setTime(TIME)
        gc.statusInTimestampViewShouldBe(gc.NOT_CREATED)

        ftp.uploadFiles(
            ftp.CSE_IMPORT_D2CC,
            [
                'grc-inputs-files-d2cc-process/20210901_2230_test_network.uct',
                'grc-inputs-files-d2cc-process/20210901_2230_213_GSK_CO_CSE1.xml',
                'grc-inputs-files-d2cc-process/20210901_2230_213_CRAC_CO_CSE1.xml',
                'grc-inputs-files-d2cc-process/2021_test_NTC_annual.xml',
                'us-import-daily-files/20210901_2D3_NTC_reductions_test.xml'
                ],
            [ftp.CGM, ftp.GLSK, ftp.CRAC, ftp.NTC, ftp.NTC_RED]
        )

        cy.visit(URL)
        gc.getTimestampView()
        gc.setDate(DATE)
        gc.setTime(TIME)
        gc.statusInTimestampViewShouldBe(gc.READY, TIMEOUT_UPLOAD)
        gc.runButtonShouldBeEnabled()
        gc.runComputation()
        gc.statusInTimestampViewShouldBe(gc.RUNNING, TIMEOUT)
        gc.statusInTimestampViewShouldBe(gc.SUCCESS, TIMEOUT)

        minio.runOnMinio(() => {
            minio.deleteProcessFolder(minio.CSE_IMPORT_D2CC);
        });
        ftp.deleteProcessFolder(ftp.CSE_IMPORT_D2CC)
    })
})