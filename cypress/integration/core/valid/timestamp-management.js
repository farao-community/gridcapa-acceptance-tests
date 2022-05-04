/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as gc from "../../../support/function";
import {selectTimestampViewForDate} from "../../../support/function";

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('Timestamp management across the whole application', () => {
    it('Test date change in business date view after changing it in timestamp view', () => {
        gc.clearAndVisit('/core/valid')
        gc.authentication()
        selectTimestampViewForDate("2021-07-02")
        gc.setupTime("16:30")
        gc.getBusinessDateView();
        gc.checkDateValue("2021-07-02")
        gc.setupDate("2021-07-03")
        gc.getTimestampView()
        gc.checkDateValue("2021-07-03")
        gc.checkTimeValue("16:30")
    });
})