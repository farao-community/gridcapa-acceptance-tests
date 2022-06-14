/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as gc from "../../support/function";
import * as minio from "../../support/minio";
import * as ftp from "../../support/ftp-browser.js";
import {
    clickRunButton,
    runButtonStatusShouldBeEnabled,
    selectTimestampViewForDate,
    timestampStatusShouldBe
} from "../../support/function";
import * as task from "../../support/task";

const minioUser = Cypress.env('GRIDCAPA_MINIO_USER');
const minioPassword = Cypress.env('GRIDCAPA_MINIO_PASSWORD')
const cgm = 'cgms';
const glsk = 'glsks';
const crac = 'cracs';
const ntc = 'ntc';
const ntcred = 'ntcreds'
const TIMEOUT_UPLOAD = 120000
const TIMEOUT = 60000
Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('Check CSE D2CC import corner runs correctly', () => {

    it('Check CSE D2CC import corner runs correctly', () => {
        gc.clearAndVisit('/cse/import/d2cc')
        gc.authentication()
        task.checkTaskNotCreated('2021-09-01', '22:30')

        ftp.uploadFilesOnFtp('CSE_D2CC',
            [
                'grc-inputs-files-d2cc-process/20210901_2230_test_network.uct',
                'grc-inputs-files-d2cc-process/20210901_2230_213_GSK_CO_CSE1.xml',
                'grc-inputs-files-d2cc-process/20210901_2230_213_CRAC_CO_CSE1.xml',
                'grc-inputs-files-d2cc-process/2021_test_NTC_annual.xml',
                'us-import-daily-files/20210901_2D3_NTC_reductions_test.xml'
                ],
            [cgm, glsk, crac, ntc, ntcred])

        cy.visit('/cse/import/d2cc')
        selectTimestampViewForDate('2021-09-01')
        gc.setupTime('22:30')
        timestampStatusShouldBe('READY', TIMEOUT_UPLOAD)
        runButtonStatusShouldBeEnabled()
        clickRunButton()
        timestampStatusShouldBe('RUNNING', TIMEOUT)
        timestampStatusShouldBe('SUCCESS', TIMEOUT)

        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFolderFromMinio('/gridcapa/CSE/IMPORT/', 'D2CC');
        });
        ftp.deleteFolderOnFtp( '/cse/import/', 'd2cc');
    })
})