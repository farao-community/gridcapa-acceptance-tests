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
const crac = 'cracs';
const TIMEOUT = 60000;
const TIMEOUT_UPLOAD = 60000
Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('Check CSE D2CC export corner runs correctly', () => {

    it('Check CSE D2CC export corner runs correctly', () => {
        ftp.uploadOnFtp('CSE_EXPORT_D2CC', 'run-export/20220128_1630_155_Initial_CSE1_Transit.uct', cgm)
        ftp.uploadOnFtp('CSE_EXPORT_D2CC', 'run-export/20220128_1630_145_CRAC_CO_CSE1_Transit.xml', crac)
        gc.clearAndVisit('/cse/export/d2cc')
        gc.authentication()
        selectTimestampViewForDate('2022-01-28')
        gc.setupTime('16:30')
        timestampStatusShouldBe('READY', TIMEOUT_UPLOAD)
        runButtonStatusShouldBeEnabled()
        clickRunButton()
        // Automatic run on file arrival -- NOT FOR NOW
        timestampStatusShouldBe('RUNNING', TIMEOUT)
        timestampStatusShouldBe('SUCCESS', TIMEOUT)

        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFolderFromMinio('/gridcapa/CSE/EXPORT/', 'D2CC');
        });
        ftp.deleteOnFtp('CSE_EXPORT_D2CC', 'cgms/20220128_1630_155_Initial_CSE1_Transit.uct')
        ftp.deleteOnFtp('CSE_EXPORT_D2CC', 'cracs/20220128_1630_145_CRAC_CO_CSE1_Transit.xml')
    })
})