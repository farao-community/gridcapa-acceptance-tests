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
    selectTimestampViewForDate, timestampStatusShouldBe
} from "../../../support/function";
import * as ftp from "../../../support/ftp-browser";
import {fbPassword, fbUser} from "../../../support/ftp-browser";

const year = "2021";
const month = "07";
const day = "02";
const hour = "00";
const minute = "30";
const date = year + "-" + month + "-" + day
const time = hour + ":" + minute

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('Test behaviour of run button', () => {
    it('Check button is greyed when task is not created', () => {
        gc.clearAndVisit('/core/valid')
        gc.authentication()
        selectTimestampViewForDate(date)
        gc.setupTime(time)
        runButtonStatusShouldBeDisabled()
    });
    it("Check button is greyed when one file is uploaded", () => {
        ftp.runOnFtp(fbUser, fbPassword, () => {
            const cgmFullPath = 'us-0000/20210702'
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
            const cbcoraFullPath = 'grc-69/core/valid/20210702-F301-00.xml'
            const ftpCbcoraDestinationPath = '/sftp/core/valid/cbcoras'
            ftp.copyZipToFtp(cbcoraFullPath, ftpCbcoraDestinationPath);
        });
        ftp.runOnFtp(fbUser, fbPassword, () => {
            const glskFullPath = 'grc-69/core/valid/20210702-F226-00.xml'
            const ftpGlskDestinationPath = '/sftp/core/valid/glsks'
            ftp.copyZipToFtp(glskFullPath, ftpGlskDestinationPath);
        });
        ftp.runOnFtp(fbUser, fbPassword, () => {
            const refprogFullPath = 'grc-69/core/valid/20210702-F110.00.xml'
            const ftpRefprogDestinationPath = '/sftp/core/valid/refprogs'
            ftp.copyZipToFtp(refprogFullPath, ftpRefprogDestinationPath);
        });
        ftp.runOnFtp(fbUser, fbPassword, () => {
            const studypointsFullPath = 'grc-69/core/valid/20210702-Points_Etude-00.csv'
            const ftpStudypointsDestinationPath = '/sftp/core/valid/studypoints'
            ftp.copyZipToFtp(studypointsFullPath, ftpStudypointsDestinationPath);
        });
        cy.visit('/core/valid')
        selectTimestampViewForDate(date)
        gc.setupTime(time)
        timestampStatusShouldBe('READY')
        runButtonStatusShouldBeEnabled()
    })
})