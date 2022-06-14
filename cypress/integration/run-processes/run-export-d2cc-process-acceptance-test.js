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
import * as task from "../../support/task";

const minioUser = Cypress.env('GRIDCAPA_MINIO_USER');
const minioPassword = Cypress.env('GRIDCAPA_MINIO_PASSWORD')
const cgm = 'cgms';
const crac = 'cracs';
const TIMEOUT = 60000;

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('Check CSE D2CC export corner runs correctly', () => {

    it('Check CSE D2CC export corner runs correctly', () => {
        gc.clearAndVisit('/cse/export/d2cc')
        gc.authentication()
        task.checkTaskNotCreated('2022-01-28', '16:30')
        ftp.uploadFilesOnFtp('CSE_EXPORT_D2CC', 
            ['run-export/20220128_1630_155_Initial_CSE1_Transit.uct',
                'run-export/20220128_1630_145_CRAC_CO_CSE1_Transit.xml'], 
            [cgm, crac])

        cy.visit('/cse/export/d2cc')
        selectTimestampViewForDate('2022-01-28')
        gc.setupTime('16:30')

        // Automatic run on file arrival
        timestampStatusShouldBe('RUNNING', TIMEOUT)
        timestampStatusShouldBe('SUCCESS', TIMEOUT)

        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFolderFromMinio('/gridcapa/CSE/EXPORT/', 'D2CC');
        });
        ftp.deleteFolderOnFtp( '/cse/export/', 'd2cc');
    })
})