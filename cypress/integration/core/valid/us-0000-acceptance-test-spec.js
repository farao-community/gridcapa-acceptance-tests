/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as gc from "../../../support/function";
import * as task from "../../../support/task";
import * as ftp from "../../../support/ftp-browser.js";
import * as minio from "../../../support/minio.js";

const minioUser = Cypress.env('GRIDCAPA_MINIO_USER');
const minioPassword = Cypress.env('GRIDCAPA_MINIO_PASSWORD')
const cgm = 'CGM';
Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('CGM automatic import handling', () => {
    it('Triggers multiple task creation when CGM archive with multiple CGM and no zip extension arrives', () => {
        gc.clearAndVisit('/core/valid')
        gc.authentication()
        task.checkTasksNotCreatedInBDView('2021-07-02')
        ftp.uploadOnFtp('CORE_VALID', 'us-0000/20210702.zip', 'cgms')
        cy.visit('/core/valid')
        // Check arrival in TS view
        task.checkTasksCreated('2021-07-02', '20210702_{0}30_2D5_UX0.uct', cgm)
        // Check arrival in BD view
        task.checkTasksCreatedInBDView('2021-07-02')
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFolderFromMinio('/gridcapa/CORE/', 'VALID');
        });
        ftp.deleteFolderOnFtp( '/core/', 'valid');
    });
})
