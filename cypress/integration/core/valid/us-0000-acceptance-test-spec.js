/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as gc from "../../../support/gridcapa-util";
import * as ftp from "../../../support/ftp-browser.js";
import * as minio from "../../../support/minio.js";

const URL = '/core/valid'
const DATE = '2021-07-02'

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('CGM automatic import handling', () => {

    it('Triggers multiple task creation when CGM archive with multiple CGM and no zip extension arrives', () => {
        gc.clearAndVisit(URL)
        gc.authenticate()
        gc.getBusinessDateView()
        gc.setDate(DATE)
        gc.businessDateTasksStatusShouldBe(DATE, gc.NOT_CREATED)

        ftp.uploadFileByFileTypeOnFb(ftp.CORE_VALID, 'us-0000/20210702.zip', ftp.CGM)

        cy.visit(URL)
        // Check arrival in TS view
        gc.getTimestampView()
        gc.setDate(DATE)
        gc.businessDateFilesShouldBeUploaded('20210702_{0}30_2D5_UX0.uct', 'CGM')
        // Check arrival in BD view
        gc.getBusinessDateView()
        gc.setDate(DATE)
        gc.businessDateTasksStatusShouldBe(DATE, gc.CREATED)

        minio.runOnMinio(() => {
            minio.deleteProcessFolder(minio.CORE_VALID);
        });
        ftp.deleteProcessFolderOnFb(ftp.CORE_VALID);
    });
})
