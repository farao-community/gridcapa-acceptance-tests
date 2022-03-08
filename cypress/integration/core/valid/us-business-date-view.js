/*
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as gc from "../../../support/function";
import * as task from "../../../support/task";
import {checkTaskStatusInBusinessDateViewShouldBe} from "../../../support/task";
import * as ftp from "../../../support/ftp-browser";
import {fbPassword, fbUser} from "../../../support/ftp-browser";
import {clickRunButton, selectTimestampViewForDate, timestampStatusShouldBe} from "../../../support/function";
import * as minio from "../../../support/minio";

const minioUser = Cypress.env('GRIDCAPA_MINIO_USER');
const minioPassword = Cypress.env('GRIDCAPA_MINIO_PASSWORD')
const TIMEOUT = 30000

describe('Business date view ', () => {

    it('View the status of each TS when the inputs are not available', () => {
        gc.clearAndVisit('/core/valid')
        gc.authentication()
        task.checkTasksNotCreatedInBusinessDateView('2021-07-23')
    });

    it('View the status update when all the inputs of a TS are available and when a task is started in the Timestamp view' , () => {
        gc.clearAndVisit('/core/valid')
        gc.authentication()
        task.checkTasksNotCreatedInBusinessDateView('2021-07-23')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyZipToFtp('grc-69-run-process/core/valid/20210723_0030_2D5_CGM.uct', '/sftp/core/valid/cgms');
            ftp.copyZipToFtp('grc-69-run-process/core/valid/20210723-F301-01.xml', '/sftp/core/valid/cbcoras');
            ftp.copyZipToFtp('grc-69-run-process/core/valid/20210723-F226-v1.xml', '/sftp/core/valid/glsks');
            ftp.copyZipToFtp('grc-69-run-process/core/valid/20210723-F110.xml', '/sftp/core/valid/refprogs');
            ftp.copyZipToFtp('grc-69-run-process/core/valid/20210723-Points_Etude-v01.csv', '/sftp/core/valid/studypoints');
        });
        gc.clearAndVisit('/core/valid')
        checkTaskStatusInBusinessDateViewShouldBe('2021-07-23', '00:30', 'READY')
        selectTimestampViewForDate('2021-07-23')
        gc.setupTime('00:30')
        timestampStatusShouldBe('READY', TIMEOUT)
        clickRunButton()
        checkTaskStatusInBusinessDateViewShouldBe('2021-07-23', '00:30', 'RUNNING')
    });

    it('View the status of a TS after the deletion of some inputs', () => {
        gc.clearAndVisit('/core/valid')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyZipToFtp('grc-69-run-process/core/valid/20210723_1530_2D5_CGM.uct', '/sftp/core/valid/cgms');
        });
        gc.clearAndVisit('/core/valid')
        gc.authentication()
        checkTaskStatusInBusinessDateViewShouldBe('2021-07-23', '15:30', 'READY')
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFilesFromMinio([
                '/gridcapa/CORE/VALID/CGMs/20210723_1530_2D5_CGM.uct',])
        });
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFilesFromFtp([
                '/sftp/core/valid/cgms/20210723_1530_2D5_CGM.uct',
            ]);
        });
        gc.clearAndVisit('/core/valid')
        checkTaskStatusInBusinessDateViewShouldBe('2021-07-23', '15:30', 'CREATED')
    });

    it("Delete files", () => {
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFilesFromMinio([
                '/gridcapa/CORE/VALID/CGMs/20210723_0030_2D5_CGM.uct',
                '/gridcapa/CORE/VALID/CGMs/20210723_1530_2D5_CGM.uct',
                '/gridcapa/CORE/VALID/CBCORAs/20210723-F301-01.xml',
                '/gridcapa/CORE/VALID/GLSKs/20210723-F226-v1.xml',
                '/gridcapa/CORE/VALID/REFPROGs/20210723-F110.xml',
                '/gridcapa/CORE/VALID/STUDYPOINTs/20210723-Points_Etude-v01.csv',
                '/gridcapa/CORE/VALID/artifacts/20210723_0030_2D5_CGM_0_9.xiidm',
                '/gridcapa/CORE/VALID/artifacts/raoParameters.json',
                '/gridcapa/CORE/VALID/artifacts/crac_2021-07-22T22:30Z.json',
                '/gridcapa/CORE/VALID/outputs/20210723-00-ValidationCORE-v0.csv'
            ]);
        });
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFilesFromFtp([
                '/sftp/core/valid/cgms/20210723_0030_2D5_CGM.uct',
                '/sftp/core/valid/cgms/20210723_1530_2D5_CGM.uct',
                '/sftp/core/valid/cbcoras/20210723-F301-01.xml',
                '/sftp/core/valid/glsks/20210723-F226-v1.xml',
                '/sftp/core/valid/refprogs/20210723-F110.xml',
                '/sftp/core/valid/studypoints/20210723-Points_Etude-v01.csv',
                '/sftp/core/valid/outputs/20210723-00-ValidationCORE-v0.csv'
            ]);
        });
    })

})