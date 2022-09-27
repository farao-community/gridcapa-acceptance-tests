/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as gc from "../../../support/gridcapa-util";
import * as ftp from "../../../support/ftp-browser.js";
import * as minio from "../../../support/minio.js";

const URL = '/cse/import/d2cc'
const CGM = 'CGM'
const HOURS = [0, 3, 7, 10, 13, 16, 19, 22]

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

function cleanData() {
    minio.runOnMinio(() => {
        minio.deleteProcessFolder(minio.CSE_IMPORT_D2CC);
    })
    ftp.deleteProcessFolder(ftp.CSE_IMPORT_D2CC)
}

describe('CGM automatic import handling', () => {

    it('Triggers one task creation when CGM archive with one CGM arrives', () => {
        gc.clearAndVisit(URL)
        gc.authenticate()

        gc.getTimestampView()
        gc.setDate('2021-07-01')
        gc.setTime('14:30')
        gc.statusInTimestampViewShouldBe(gc.NOT_CREATED)

        ftp.uploadFileByFileType(ftp.CSE_IMPORT_D2CC, 'us-0000/20210701.zip', ftp.CGM)

        cy.visit(URL)
        gc.getTimestampView()
        gc.setDate('2021-07-01')
        gc.setTime('14:30')
        gc.fileShouldBeUploaded('20210701_1430_2D4_UX0.uct', CGM)

        cleanData()
    });

    it('Triggers multiple task creation when CGM archive with multiple CGM arrives', () => {
        gc.clearAndVisit(URL)
        gc.authenticate()

        gc.getBusinessDateView()
        gc.setDate('2021-07-02')
        gc.businessDateWithHoursTasksStatusShouldBe('2021-07-02', HOURS, gc.NOT_CREATED)

        ftp.uploadFileByFileType(ftp.CSE_IMPORT_D2CC, 'us-0000/20210702.zip', ftp.CGM)

        cy.visit(URL)
        gc.getBusinessDateView()
        gc.setDate('2021-07-02')
        gc.businessDateWithHoursTasksStatusShouldBe('2021-07-02', HOURS, gc.CREATED)

        cleanData()
    });

    it('Triggers no task creation when CGM archive is empty', () => {
        gc.clearAndVisit(URL)
        gc.authenticate()

        gc.getTimestampView()
        gc.setDate('2021-07-03')
        gc.setTime('00:30')
        gc.statusInTimestampViewShouldBe(gc.NOT_CREATED)

        ftp.uploadFileByFileType(ftp.CSE_IMPORT_D2CC, 'us-0000/20210703.zip', ftp.CGM)
        cy.wait(2000) // To make sure nothing is created even after a couple of seconds - 5s

        cy.visit(URL)
        gc.getTimestampView()
        gc.setDate('2021-07-03')
        gc.setTime('00:30')
        gc.statusInTimestampViewShouldBe(gc.NOT_CREATED)

        ftp.deleteProcessFolder(ftp.CSE_IMPORT_D2CC)
    });

    it('Triggers multiple task creation when CGM archive with multiple CGM and subdirectories arrives', () => {
        gc.clearAndVisit(URL)
        gc.authenticate()

        gc.getBusinessDateView()
        gc.setDate('2021-07-02')
        gc.businessDateWithHoursTasksStatusShouldBe('2021-07-02', HOURS, gc.NOT_CREATED)

        ftp.uploadFileByFileType(ftp.CSE_IMPORT_D2CC, 'us-0000/20210702_sub_dir.zip', ftp.CGM)

        cy.visit(URL)
        gc.getBusinessDateView()
        gc.setDate('2021-07-02')
        gc.businessDateWithHoursTasksStatusShouldBe('2021-07-02', HOURS, gc.CREATED)

        cleanData()
    });

    it('Triggers a task creation when a bare CGM file arrives', () => {
        gc.clearAndVisit(URL)
        gc.authenticate()

        gc.getTimestampView()
        gc.setDate('2021-07-02')
        gc.setTime('23:30')
        gc.statusInTimestampViewShouldBe(gc.NOT_CREATED)

        ftp.uploadFileByFileType(ftp.CSE_IMPORT_D2CC, 'us-0000/20210702_2330_2D5_UX0.uct', ftp.CGM)

        cy.visit(URL)
        gc.getTimestampView()
        gc.setDate('2021-07-02')
        gc.setTime('23:30')
        gc.fileShouldBeUploaded('20210702_2330_2D5_UX0.uct', CGM)

        cleanData()
    });
})
