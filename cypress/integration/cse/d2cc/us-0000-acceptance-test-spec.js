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

const WAIT_FOR_UPLOAD = 10000
const WAIT_FOR_DELETION = 5000

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('CGM automatic import handling', () => {
    it('Triggers one task creation when CGM archive with one CGM arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        cgm.checkUnloadedCgm('2021-07-01', '14:30')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyZipToFtp('us-0000/20210701.zip', '/ftp/cse/d2cc/cgms');
        });
        cy.wait(WAIT_FOR_UPLOAD)
        cy.visit('/cse/d2cc')
        cgm.checkLoadedCgm('2021-07-01', '14:30', '20210701_1430_2D4_UX0.uct')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/ftp/cse/d2cc/cgms/20210701.zip', 'base64');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFileFromMinio('/gridcapa/CSE/D2CC/CGMs/', '20210701_1430_2D4_UX0.uct')
            cy.wait(WAIT_FOR_DELETION)
        })
    });

    it('Triggers multiple task creation when CGM archive with multiple CGM arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        cgm.checkUnloadedCgmsOnBD('2021-07-02')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyZipToFtp('us-0000/20210702.zip', '/ftp/cse/d2cc/cgms');
        });
        cy.wait(WAIT_FOR_UPLOAD)
        cy.visit('/cse/d2cc')
        cgm.checkLoadedCgmsOnBD('2021-07-02', '20210702_{0}30_2D5_UX0.uct')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/ftp/cse/d2cc/cgms/20210702.zip');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteHourlyFilesFromMinio('/gridcapa/CSE/D2CC/CGMs/', '20210702_{0}30_2D5_UX0.uct')
            cy.wait(WAIT_FOR_DELETION)
        })
    });

    it('Triggers no task creation when CGM archive is empty', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        cgm.checkUnloadedCgm('2021-07-03', '00:30')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyZipToFtp('us-0000/20210703.zip', '/ftp/cse/d2cc/cgms');
        });
        cy.wait(WAIT_FOR_UPLOAD)
        cy.visit('/cse/d2cc')
        cgm.checkUnloadedCgm('2021-07-03', '00:30')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/ftp/cse/d2cc/cgms/20210703.zip');
        });
    });

    it('Triggers multiple task creation when CGM archive with multiple CGM and subdirectories arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        cgm.checkUnloadedCgmsOnBD('2021-07-02')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyZipToFtp('us-0000/20210702_sub_dir.zip', '/ftp/cse/d2cc/cgms');
        });
        cy.wait(WAIT_FOR_UPLOAD)
        cy.visit('/cse/d2cc')
        cgm.checkLoadedCgmsOnBD('2021-07-02', '20210702_{0}30_2D5_UX0.uct')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/ftp/cse/d2cc/cgms/20210702_sub_dir.zip');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteHourlyFilesFromMinio('/gridcapa/CSE/D2CC/CGMs/', '20210702_{0}30_2D5_UX0.uct')
            cy.wait(WAIT_FOR_DELETION)
        })
    });

    it('Triggers a task creation when a bare CGM file arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        cgm.checkUnloadedCgm('2021-07-02', '23:30')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyFileToFtp('us-0000/20210702_2330_2D5_UX0.uct', '/ftp/cse/d2cc/cgms');
        });
        cy.wait(WAIT_FOR_UPLOAD)
        cy.visit('/cse/d2cc')
        cgm.checkLoadedCgm('2021-07-02', '23:30', '20210702_2330_2D5_UX0.uct')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/ftp/cse/d2cc/cgms/20210702_2330_2D5_UX0.uct');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFileFromMinio('/gridcapa/CSE/D2CC/CGMs/', '20210702_2330_2D5_UX0.uct')
            cy.wait(WAIT_FOR_DELETION)
        })
    });
})
