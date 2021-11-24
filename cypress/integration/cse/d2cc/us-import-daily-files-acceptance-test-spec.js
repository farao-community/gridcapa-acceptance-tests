/*
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as gc from "../../../support/function";
import * as minio from "../../../support/minio";
import * as vulcanus from "../../../support/vulcanus";
import * as ftp from "../../../support/ftp-browser.js";

const minioUser = Cypress.env('GRIDCAPA_MINIO_USER');
const minioPassword = Cypress.env('GRIDCAPA_MINIO_PASSWORD')

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('VULCANUS automatic import handling', () => {
    it('Triggers 24 tasks creation when VULCANUS arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        vulcanus.checkUnloadedVulcanus('2021-03-01')
        ftp.uploadOnFtp('us-import-daily-files/vulcanus_01032021_96.xls', 'vulcanus')
        cy.wait(10000)
        cy.visit('/cse/d2cc')
        vulcanus.checkLoadedVulcanus('2021-03-01', 'vulcanus_01032021_96.xls')
        ftp.deleteOnFtp('vulcanus/vulcanus_01032021_96.xls')
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFileFromMinio('/gridcapa/CSE/D2CC/VULCANUS/', 'vulcanus_01032021_96.xls')
        })
    });
})