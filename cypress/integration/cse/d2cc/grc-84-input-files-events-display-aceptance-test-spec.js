/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as gc from "../../../support/function";
import * as minio from "../../../support/minio";
import * as ftp from "../../../support/ftp-browser.js";

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

function goToEvents() {
    gc.clearAndVisit('/cse/import/d2cc')
    gc.authenticate()
    gc.getTimestampView()
    gc.getEvents()
    gc.setDate('2021-09-01')
    gc.setTime('22:30')
}

describe('CGM input events displaying', () => {

    it('Triggers task creation and event display when file arrives, then update event when file updated, and deletion event when file deleted', () => {
        ftp.uploadFiles(
            ftp.CSE_IMPORT_D2CC,
            [
                'gcr-84-input-files-events-display/20210901_2230_test_network.uct',
                'gcr-84-input-files-events-display/20210901_2230_test_network1.uct',
                'gcr-84-input-files-events-display/20210901_2230_glsk.xml'
            ],
            [ftp.CGM, ftp.CGM, ftp.GLSK]
        )

        // wait for upload
        cy.wait(2000)

        // delete glsk file
        minio.runOnMinio(() => {
            minio.deleteFileFromMinio('/gridcapa/CSE/IMPORT/D2CC/GLSKs/', '20210901_2230_glsk.xml')
        })

        goToEvents();
        gc.eventShouldBe('INFO', 'The CGM : \'20210901_2230_test_network.uct\' is available')
        gc.eventShouldBe('INFO', 'A new version of CGM is available : \'20210901_2230_test_network1.uct\'')
        gc.eventShouldBe('INFO', 'The GLSK : \'20210901_2230_glsk.xml\' is available')
        gc.eventShouldBe('INFO', 'The GLSK : \'20210901_2230_glsk.xml\' is deleted')

        // cleaning
        minio.runOnMinio(() => {
            minio.deleteProcessFolder(minio.CSE_IMPORT_D2CC);
        });
        ftp.deleteProcessFolder(ftp.CSE_IMPORT_D2CC);
    });
})