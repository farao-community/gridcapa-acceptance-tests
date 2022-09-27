/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as gc from "../../../support/gridcapa-util";

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('Timestamp management across the whole application', () => {
    it('Test date change in business date view after changing it in timestamp view', () => {
        gc.clearAndVisit('/core/valid')
        gc.authenticate()
        gc.getTimestampView()
        gc.setDate("2021-07-02")
        gc.setTime("16:30")
        gc.getBusinessDateView()
        gc.dateShouldBe("2021-07-02")

        gc.setDate("2021-07-03")
        gc.getTimestampView()
        gc.dateShouldBe("2021-07-03")
        gc.timeShouldBe("16:30")
    });
})