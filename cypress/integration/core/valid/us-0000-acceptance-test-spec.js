/*
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as gc from "../../../support/function";
import * as cgm from "../../../support/cgm";
import * as ftp from "../../../support/ftp-browser.js";
import * as minio from "../../../support/minio.js";

const fbUser = Cypress.env('GRIDCAPA_FB_USER');
const fbPassword = Cypress.env('GRIDCAPA_FB_PASSWORD')
const minioUser = Cypress.env('GRIDCAPA_MINIO_USER');
const minioPassword = Cypress.env('GRIDCAPA_MINIO_PASSWORD')

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('CGM automatic import handling', () => {
    it('Triggers multiple task creation when CGM archive with multiple CGM and no zip extension arrives', () => {
        gc.clearAndVisit('/core/valid')
        gc.authentication()
        cgm.checkUnloadedCgmsOnBD('2021-07-02')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyZipToFtp('us-0000/20210702', '/sftp/core/valid/cgms');
        });
        cy.visit('/core/valid')
        cgm.checkLoadedCgmsOnBD('2021-07-02', '20210702_{0}30_2D5_UX0.uct')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/sftp/core/valid/cgms/20210702');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteHourlyFilesFromMinio('/gridcapa/CORE/VALID/CGMs/', '20210702_{0}30_2D5_UX0.uct')
        })
    });
})
