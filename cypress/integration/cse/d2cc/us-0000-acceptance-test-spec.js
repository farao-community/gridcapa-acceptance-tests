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

String.prototype.format = function() {
    let a = this;
    for (let k in arguments) {
        a = a.replace("{" + k + "}", arguments[k])
    }
    return a
}

describe('CGM automatic import handling', () => {
    it('Triggers one task creation when CGM archive with one CGM arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        cgm.checkUnloadedCgm('2021-07-01', '14:30')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyZipToFtp('us-0000/20210701.zip', '/cse/d2cc/cgms');
        });
        cy.visit('/cse/d2cc')
        cgm.checkLoadedCgm('2021-07-01', '14:30', '20210701_1430_2D4_UX0.uct')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/cse/d2cc/cgms/20210701.zip', 'base64');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFileFromMinio('/gridcapa/CSE/D2CC/CGMs/', '20210701_1430_2D4_UX0.uct')
        })
    });

    it('Triggers multiple task creation when CGM archive with multiple CGM arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        cgm.checkUnloadedCgmsOnBD('2021-07-02')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyZipToFtp('us-0000/20210702.zip', '/cse/d2cc/cgms');
        });
        cy.visit('/cse/d2cc')
        cgm.checkLoadedCgmsOnBD('2021-07-02', '20210702_{0}30_2D5_UX0.uct')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/cse/d2cc/cgms/20210702.zip');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteHourlyFilesFromMinio('/gridcapa/CSE/D2CC/CGMs/', '20210702_{0}30_2D5_UX0.uct')
        })
    });

    it('Triggers no task creation when CGM archive is empty', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        cgm.checkUnloadedCgm('2021-07-03', '00:30')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyZipToFtp('us-0000/20210703.zip', '/cse/d2cc/cgms');
        });
        cy.visit('/cse/d2cc')
        cgm.checkUnloadedCgm('2021-07-03', '00:30')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/cse/d2cc/cgms/20210703.zip');
        });
    });

    it('Triggers multiple task creation when CGM archive with multiple CGM and no zip extension arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        cgm.checkUnloadedCgmsOnBD('2021-07-02')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyZipToFtp('us-0000/20210702', '/cse/d2cc/cgms');
        });
        cy.visit('/cse/d2cc')
        cgm.checkLoadedCgmsOnBD('2021-07-02', '20210702_{0}30_2D5_UX0.uct')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/cse/d2cc/cgms/20210702');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteHourlyFilesFromMinio('/gridcapa/CSE/D2CC/CGMs/', '20210702_{0}30_2D5_UX0.uct')
        })
    });

    it('Triggers multiple task creation when CGM archive with multiple CGM and subdirectories arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        cgm.checkUnloadedCgmsOnBD('2021-07-02')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyZipToFtp('us-0000/20210702_sub_dir.zip', '/cse/d2cc/cgms');
        });
        cy.visit('/cse/d2cc')
        cgm.checkLoadedCgmsOnBD('2021-07-02', '20210702_{0}30_2D5_UX0.uct')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/cse/d2cc/cgms/20210702_sub_dir.zip');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteHourlyFilesFromMinio('/gridcapa/CSE/D2CC/CGMs/', '20210702_{0}30_2D5_UX0.uct')
        })
    });

    it('Triggers a task creation when a bare CGM file arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        cgm.checkUnloadedCgm('2021-07-02', '23:30')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyFileToFtp('us-0000/20210702_2330_2D5_UX0.uct', '/cse/d2cc/cgms');
        });
        cy.visit('/cse/d2cc')
        cgm.checkLoadedCgm('2021-07-02', '23:30', '20210702_2330_2D5_UX0.uct')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/cse/d2cc/cgms/20210702_2330_2D5_UX0.uct');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFileFromMinio('/gridcapa/CSE/D2CC/CGMs/', '20210702_2330_2D5_UX0.uct')
        })
    });
})
