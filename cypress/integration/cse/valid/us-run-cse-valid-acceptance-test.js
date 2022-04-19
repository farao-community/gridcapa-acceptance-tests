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
import {fbPassword, fbUser} from "../../../support/ftp-browser";

const TIMEOUT = 30000

fullIhmTestCseValid("d2cc");
fullIhmTestCseValid("idcc");

function fullIhmTestCseValid(process) {
    function getTtcAdjustmentFile(process) {
        if (process === "d2cc") return "/cse/valid/d2cc/TTC_Adjustment_20211125_2D_CSE.zip"
        if (process === "idcc") return "/cse/valid/idcc/TTC_Adjustment_20211005_ID_CSE.zip"
    }

    function getCracFile(process) {
        if (process === "d2cc") return "/cse/valid/d2cc/CRAC_2D_CSE_Validation_20211125V01.zip"
        if (process === "idcc") return "/cse/valid/idcc/CRAC_ID_CSE_Validation_20211005V03.zip"
    }

    function getCgmFile(process) {
        if (process === "d2cc") return "/cse/valid/d2cc/22V-TERNA-ECPPRG_22V-TERNA-ECPPRG_CCC-CGMSel_20211125V01_0.zip"
        if (process === "idcc") return "/cse/valid/idcc/10V-CAO---ECP-PN_10V-CSE-FR---TSN_CCC-XBID2-CGMSel-TEST_20211005V03.zip"
    }

    function getGlskFile(process) {
        if (process === "d2cc") return "/cse/valid/d2cc/22V-TERNA-ECPPRG_22V-TERNA-ECPPRG_CCC-GSKSel_20211125V01_1.zip"
        if (process === "idcc") return "/cse/valid/idcc/10V-CAO---ECP-PN_10V-CSE-FR---TSN_CCC-XBID2-GSKSel-TEST_20211005V03.zip"
    }

    function getDate(process) {
        if (process === "d2cc") return "2021-11-25"
        if (process === "idcc") return "2021-10-05"
    }

    function getTime(process) {
        if (process === "d2cc") return "00:30"
        if (process === "idcc") return "19:30"
    }

    let urlProcess = "/cse/valid/" + process
    let date = getDate(process);
    let time = getTime(process);

    describe('Full IHM test', () => {
        it('Check button is disabled when task is not created', () => {
            gc.clearAndVisit(urlProcess)
            gc.authentication()
            selectTimestampViewForDate(date)
            gc.setupTime(time)
            runButtonStatusShouldBeDisabled()
        });
        it("Check button is disabled and the status is created when one file is uploaded", () => {
            ftp.runOnFtp(fbUser, fbPassword, () => {
                ftp.copyZipToFtp(getTtcAdjustmentFile(process), "/sftp/gridcapa/data/inputs/cia");
            });
            cy.visit(urlProcess)
            selectTimestampViewForDate(date)
            gc.setupTime(time)
            runButtonStatusShouldBeDisabled()
            timestampStatusShouldBe('CREATED', TIMEOUT)
        });
        it("Check button is clickable when task is ready", () => {
            ftp.runOnFtp(fbUser, fbPassword, () => {
                ftp.copyZipToFtp(getCracFile(process), "/sftp/gridcapa/data/inputs/cia");
                ftp.copyZipToFtp(getCgmFile(process), "/sftp/gridcapa/data/inputs/ecp");
                ftp.copyZipToFtp(getGlskFile(process), "/sftp/gridcapa/data/inputs/ecp");
            });
            cy.visit(urlProcess)
            selectTimestampViewForDate(date)
            gc.setupTime(time)
            timestampStatusShouldBe('READY', TIMEOUT)
            runButtonStatusShouldBeEnabled()
        });
        it("Check status change to running after run click and goes to success", () => {
            cy.visit(urlProcess)
            selectTimestampViewForDate(date)
            gc.setupTime(time)
            timestampStatusShouldBe('READY', TIMEOUT)
            clickRunButton()
            timestampStatusShouldBe('RUNNING', TIMEOUT)
            timestampStatusShouldBe('SUCCESS', TIMEOUT)
            runButtonStatusShouldBeEnabled()
        })
    })
}
