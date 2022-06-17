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

const minioUser = Cypress.env('GRIDCAPA_MINIO_USER');
const minioPassword = Cypress.env('GRIDCAPA_MINIO_PASSWORD')
const cgm = 'cgms';
const glsk = 'glsks';
const crac = 'cracs';
const ntc = 'ntc';
const targetchs = 'targetchs'
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
        ftp.uploadOnFtp('CSE_D2CC', 'grc-inputs-files-d2cc-process/20210901_2230_test_network.uct', cgm)
        ftp.uploadOnFtp('CSE_D2CC', 'grc-inputs-files-d2cc-process/20210901_2230_213_GSK_CO_CSE1.xml', glsk)
        ftp.uploadOnFtp('CSE_D2CC', 'grc-inputs-files-d2cc-process/20210901_2230_213_CRAC_CO_CSE1.xml', crac)
        ftp.uploadOnFtp('CSE_D2CC', 'grc-inputs-files-d2cc-process/2021_test_NTC_annual.xml', ntc)
        ftp.uploadOnFtp('CSE_D2CC', 'grc-inputs-files-d2cc-process/2021_target_ch_annual.xml', targetchs)
        ftp.uploadOnFtp('CSE_D2CC', 'us-import-daily-files/20210901_2D3_NTC_reductions_test.xml', ntcred)
        gc.clearAndVisit('/cse/import/d2cc')
        gc.authentication()
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
        ftp.deleteOnFtp('CSE_D2CC', 'cgms/20210901_2230_test_network.uct')
        ftp.deleteOnFtp('CSE_D2CC', 'glsks/20210901_2230_213_GSK_CO_CSE1.xml')
        ftp.deleteOnFtp('CSE_D2CC', 'cracs/20210901_2230_213_CRAC_CO_CSE1.xm')
        ftp.deleteOnFtp('CSE_D2CC', 'ntc/2021_test_NTC_annual.xml')
        ftp.deleteOnFtp('CSE_D2CC', 'targetchs/2021_target_ch_annual.xml')
        ftp.deleteOnFtp('CSE_D2CC', 'ntcreds/20210901_2D3_NTC_reductions_test.xml')
    })
})