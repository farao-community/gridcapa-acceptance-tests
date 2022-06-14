/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as gc from "../../../support/function";
import {
    clickRunButton,
    runButtonStatusShouldBeDisabled,
    runButtonStatusShouldBeEnabled,
    selectTimestampViewForDate,
    timestampStatusShouldBe
} from "../../../support/function";
import * as ftp from "../../../support/ftp-browser";
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
        ftp.uploadOnFtp('CORE_VALID', 'grc-69-run-process/core/valid/20210723_0030_2D5_CGM.uct', 'cgms')
        cy.visit('/core/valid')
        selectTimestampViewForDate(date)
        gc.setupTime(time)
        runButtonStatusShouldBeDisabled()
    });
    it("Check button is clickable when task is ready", () => {
        ftp.uploadFilesOnFtp(
            'CORE_VALID',
            [
                'grc-69-run-process/core/valid/20210723-F301-01.xml',
                'grc-69-run-process/core/valid/20210723-F226-v1.xml',
                'grc-69-run-process/core/valid/20210723-F110.xml',
                'grc-69-run-process/core/valid/20210723-Points_Etude-v01.csv'
            ],
            [
                'cbcoras',
                'glsks',
                'refprogs',
                'studypoints'
            ])
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
        ftp.uploadOnFtp('CORE_VALID', 'grc-69-run-process/core/valid/20210723_1530_2D5_CGM.uct', 'cgms')
        cy.visit('/core/valid')
        selectTimestampViewForDate(date)
        gc.setupTime('15:30')
        timestampStatusShouldBe('READY', TIMEOUT)
        clickRunButton()
        timestampStatusShouldBe('ERROR', TIMEOUT) // Sometimes cypress is too slow to get 'RUNNING' before 'ERROR' is shown in the HMI
        runButtonStatusShouldBeEnabled()
    })
    it("Delete files from minio and SFTP", () => {
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFolderFromMinio('/gridcapa/CORE/', 'VALID');
        });
        ftp.deleteFolderOnFtp( '/core/', 'valid');
    })
})