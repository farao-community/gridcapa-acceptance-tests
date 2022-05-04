/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as gc from "../../../support/function";
import * as minio from "../../../support/minio";
import * as task from "../../../support/task";
import * as ftp from "../../../support/ftp-browser.js";

const minioUser = Cypress.env('GRIDCAPA_MINIO_USER');
const minioPassword = Cypress.env('GRIDCAPA_MINIO_PASSWORD')
const ntcred = 'NTC-RED';

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('NTCRED automatic import handling', () => {
    it('Triggers 24 tasks creation when NTCRED arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        task.checkTasksNotCreated('2021-09-01', ntcred)
        ftp.uploadOnFtp('CSE_D2CC', 'us-import-daily-files/20210901_2D3_NTC_reductions_test.xml', 'ntcreds')
        cy.visit('/cse/d2cc')
        task.checkTasksCreatedWhenDailyFileUploaded('2021-09-01', '20210901_2D3_NTC_reductions_test.xml', ntcred)
        ftp.deleteOnFtp('CSE_D2CC', 'ntcreds/20210901_2D3_NTC_reductions_test.xml')
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFolderFromMinio('/gridcapa/CSE/', 'D2CC');
        });
    });
})