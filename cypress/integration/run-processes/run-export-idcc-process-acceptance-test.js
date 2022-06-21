/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as gc from "../../support/function";
import * as minio from "../../support/minio";
import * as ftp from "../../support/ftp-browser.js";

const URL = '/cse/export/idcc'
const DATE = '2022-01-28'
const TIME = '16:30'
const TIMEOUT = 60000

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('Check CSE IDCC export corner runs correctly', () => {

    it('Check CSE IDCC export corner runs correctly', () => {
        gc.clearAndVisit(URL)
        gc.authenticate()
        gc.getTimestampView()
        gc.setDate(DATE)
        gc.setTime(TIME)
        gc.statusInTimestampViewShouldBe(gc.NOT_CREATED)

        ftp.uploadFiles(
            ftp.CSE_EXPORT_IDCC,
            ['run-export/20220128_1630_155_Initial_CSE1_Transit.uct', 'run-export/20220128_1630_145_CRAC_CO_CSE1_Transit.xml'],
            [ftp.CGM, ftp.CRAC]
        )

        cy.visit(URL)
        gc.getTimestampView()
        gc.setDate(DATE)
        gc.setTime(TIME)
        // Automatic run on file arrival
        gc.statusInTimestampViewShouldBe(gc.RUNNING, TIMEOUT)
        gc.statusInTimestampViewShouldBe(gc.SUCCESS, TIMEOUT)

        minio.runOnMinio(() => {
            minio.deleteProcessFolder(minio.CSE_EXPORT_IDCC);
        });
        ftp.deleteProcessFolder(ftp.CSE_EXPORT_IDCC)
    })
})