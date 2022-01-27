/*
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as gc from "../../../support/function";
import {
    runButtonStatusShouldBeDisabled,
    runButtonStatusShouldBeEnabled,
    selectTimestampViewForDate,
    timestampStatusShouldBe,
    clickRunButton, timestampShouldBeRunningOrAlreadyFailed,
} from "../../../support/function";
import * as ftp from "../../../support/ftp-browser";
import {fbPassword, fbUser} from "../../../support/ftp-browser";
import * as minio from "../../../support/minio";

const minioUser = Cypress.env('GRIDCAPA_MINIO_USER');
const minioPassword = Cypress.env('GRIDCAPA_MINIO_PASSWORD')

const year = "2021";
const month = "07";
const day = "23";
const hour = "00";
const minute = "30";
const date = year + "-" + month + "-" + day
const time = hour + ":" + minute

const TIMEOUT = 30000

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('Test behaviour of run button', () => {
    it('Check button is disabled when task is not created', () => {
        gc.clearAndVisit('/core/valid')
        gc.authentication()
        selectTimestampViewForDate(date)
        gc.setupTime(time)
        runButtonStatusShouldBeDisabled()
    });
    it("Check button is disabled when one file is uploaded", () => {
        ftp.runOnFtp(fbUser, fbPassword, () => {
            const cgmFullPath = 'grc-69/core/valid/20210723_0030_2D5_CGM.uct'
            const ftpCgmDestinationPath = '/sftp/core/valid/cgms'
            ftp.copyZipToFtp(cgmFullPath, ftpCgmDestinationPath);
        });
        cy.visit('/core/valid')
        selectTimestampViewForDate(date)
        gc.setupTime(time)
        runButtonStatusShouldBeDisabled()
    });
    it("Check button is clickable when task is ready", () => {
        ftp.runOnFtp(fbUser, fbPassword, () => {
            const cbcoraFullPath = 'grc-69/core/valid/20210723-F301-01.xml'
            const ftpCbcoraDestinationPath = '/sftp/core/valid/cbcoras'
            ftp.copyZipToFtp(cbcoraFullPath, ftpCbcoraDestinationPath);
        });
        ftp.runOnFtp(fbUser, fbPassword, () => {
            const glskFullPath = 'grc-69/core/valid/20210723-F226-v1.xml'
            const ftpGlskDestinationPath = '/sftp/core/valid/glsks'
            ftp.copyZipToFtp(glskFullPath, ftpGlskDestinationPath);
        });
        ftp.runOnFtp(fbUser, fbPassword, () => {
            const refprogFullPath = 'grc-69/core/valid/20210723-F110.xml'
            const ftpRefprogDestinationPath = '/sftp/core/valid/refprogs'
            ftp.copyZipToFtp(refprogFullPath, ftpRefprogDestinationPath);
        });
        ftp.runOnFtp(fbUser, fbPassword, () => {
            const studypointsFullPath = 'grc-69/core/valid/20210723-Points_Etude-v01.csv'
            const ftpStudypointsDestinationPath = '/sftp/core/valid/studypoints'
            ftp.copyZipToFtp(studypointsFullPath, ftpStudypointsDestinationPath);
        });
        cy.visit('/core/valid')
        selectTimestampViewForDate(date)
        gc.setupTime(time)
        timestampStatusShouldBe('READY', TIMEOUT)
        runButtonStatusShouldBeEnabled()
    })
    it("Check status change to running after run click and goes to success at 00:30", () => {
        cy.visit('/core/valid')
        selectTimestampViewForDate(date)
        gc.setupTime(time)
        timestampStatusShouldBe('READY', TIMEOUT)
        clickRunButton()
        timestampStatusShouldBe('RUNNING', TIMEOUT)
        timestampStatusShouldBe('SUCCESS', TIMEOUT)
        runButtonStatusShouldBeEnabled()
    })
    it("Check status change to running after run click and goes to error at 15:30", () => {
        ftp.runOnFtp(fbUser, fbPassword, () => {
            const cgmFullPath = 'grc-69/core/valid/20210723_1530_2D5_CGM.uct'
            const ftpCgmDestinationPath = '/sftp/core/valid/cgms'
            ftp.copyZipToFtp(cgmFullPath, ftpCgmDestinationPath);
        });
        cy.visit('/core/valid')
        selectTimestampViewForDate(date)
        gc.setupTime('15:30')
        timestampStatusShouldBe('READY', TIMEOUT)
        clickRunButton()
        timestampShouldBeRunningOrAlreadyFailed(TIMEOUT) // Sometimes cypress is too slow to get 'RUNNING' before 'ERROR' is shown in the HMI
        runButtonStatusShouldBeEnabled()
    })
    it("Delete files from minio and SFTP", () => {
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/sftp/core/valid/cgms/20210723_0030_2D5_CGM.uct');
            ftp.deleteFileFromFtp('/sftp/core/valid/cgms/20210723_1530_2D5_CGM.uct');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFileFromMinio('/gridcapa/CORE/VALID/CGMs/', '20210723_0030_2D5_CGM.uct');
            minio.deleteFileFromMinio('/gridcapa/CORE/VALID/CGMs/', '20210723_1530_2D5_CGM.uct');
        });
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/sftp/core/valid/cbcoras/20210723-F301-01.xml');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFileFromMinio('/gridcapa/CORE/VALID/CBCORAs/', '20210723-F301-01.xml')
        });
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/sftp/core/valid/glsks/20210723-F226-v1.xml');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFileFromMinio('/gridcapa/CORE/VALID/GLSKs/', '20210723-F226-v1.xml')
        });
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/sftp/core/valid/refprogs/20210723-F110.xml');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFileFromMinio('/gridcapa/CORE/VALID/REFPROGs/', '20210723-F110.xml')
        });
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/sftp/core/valid/studypoints/20210723-Points_Etude-v01.csv');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFileFromMinio('/gridcapa/CORE/VALID/STUDYPOINTs/', '20210723-Points_Etude-v01.csv')
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFileFromMinio('/gridcapa/CORE/VALID/artifacts/', '20210723_0030_2D5_CGM_0_9.xiidm')
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFileFromMinio('/gridcapa/CORE/VALID/artifacts/', 'raoParameters.json')
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFileFromMinio('/gridcapa/CORE/VALID/artifacts/', 'crac_2021-07-22T22:30Z.json')
        });
    })
})