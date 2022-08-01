/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as gc from "../../../support/gridcapa-util";
import * as ftp from "../../../support/ftp-browser";
import * as minio from "../../../support/minio";

const URL = '/core/valid'
const DATE = '2021-07-23'
const TIME_NIGHT = '00:30'
const TIME_DAY = '15:30'
const TIMEOUT = 30000 // 30s

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('Test behaviour of run button', () => {

    it('Check button is disabled when task is not created', () => {
        gc.clearAndVisit(URL)
        gc.authenticate()
        gc.getTimestampView()
        gc.setDate(DATE)
        gc.setTime(TIME_NIGHT)
        gc.runButtonForTimestampShouldBeDisabled(Date.parse(DATE + 'T' + TIME_NIGHT))
    });

   it("Check button is disabled when one file is uploaded", () => {
        ftp.uploadFile(ftp.CORE_VALID, 'grc-69-run-process/core/valid/20210723_0030_2D5_CGM.uct', ftp.CGM)

        cy.visit(URL)
        gc.getTimestampView()
        gc.setDate(DATE)
        gc.setTime(TIME_NIGHT)
        gc.runButtonForTimestampShouldBeDisabled(Date.parse(DATE + 'T' + TIME_NIGHT))
    });

     it("Check button is clickable when task is ready", () => {
        ftp.uploadFiles(
            ftp.CORE_VALID,
            {
                [ftp.CBCORA]: ['grc-69-run-process/core/valid/20210723-F301-01.xml'],
                [ftp.GLSK]: ['grc-69-run-process/core/valid/20210723-F226-v1.xml'],
                [ftp.REFPROG]: ['grc-69-run-process/core/valid/20210723-F110.xml'],
                [ftp.STUDYPOINT]: ['grc-69-run-process/core/valid/20210723-Points_Etude-v01.csv']
            }
        )

        cy.visit(URL)
        gc.getTimestampView()
        gc.setDate(DATE)
        gc.setTime(TIME_NIGHT)
        gc.statusInTimestampViewShouldBe(gc.READY, TIMEOUT)
        gc.runButtonForTimestampEnabled(Date.parse(DATE + 'T' + TIME_NIGHT))
    })

    it("Check status change to running after run click and goes to success at 00:30", () => {
        cy.visit(URL)
        gc.getTimestampView()
        gc.setDate(DATE)
        gc.setTime(TIME_NIGHT)
        gc.statusInTimestampViewShouldBe(gc.READY, TIMEOUT)
        gc.runComputationForTimestamp(Date.parse(DATE + 'T' + TIME_NIGHT))
        gc.statusInTimestampViewShouldBe(gc.RUNNING, TIMEOUT)
        gc.statusInTimestampViewShouldBe(gc.SUCCESS, TIMEOUT)
        gc.runButtonForTimestampEnabled(Date.parse(DATE + 'T' + TIME_NIGHT))
    })

    it("Check status change to running after run click and goes to error at 15:30", () => {
        ftp.uploadFile(ftp.CORE_VALID, 'grc-69-run-process/core/valid/20210723_1530_2D5_CGM.uct', ftp.CGM)

        cy.visit(URL)
        gc.getTimestampView()
        gc.setDate(DATE)
        gc.setTime(TIME_DAY)
        gc.statusInTimestampViewShouldBe(gc.READY, TIMEOUT)
        gc.runComputationForTimestamp(Date.parse(DATE + 'T' + TIME_DAY))
        gc.statusInTimestampViewShouldBe(gc.ERROR, TIMEOUT) // Sometimes cypress is too slow to get 'RUNNING' before 'ERROR' is shown in the HMI
        gc.runButtonForTimestampEnabled(Date.parse(DATE + 'T' + TIME_DAY))
    })

    it("Delete files from minio and SFTP", () => {
        minio.runOnMinio(() => {
            minio.deleteProcessFolder(minio.CORE_VALID);
        });
        ftp.deleteProcessFolder(ftp.CORE_VALID);
    })
})