/*
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as gc from "./function";

const vulcanus = 'VULCANUS';
const notCreated = 'NOT_CREATED';
const created = 'CREATED';
const notPresent = 'NOT_PRESENT';
const validated = 'VALIDATED';
const formattingLocal = 'en-US';

export function checkUnloadedVulcanus(date) {
    gc.getTimestampView();
    gc.setupDate(date);
    for (let hour = 0; hour < 24; hour++) {
        let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
        gc.setupTime(hourOnTwoDigits + ':30')
        gc.timestampStatusShouldBe(notCreated)
        gc.inputDataShouldBe(vulcanus, notPresent)
    }
}

export function checkLoadedVulcanus(date, filename) {
    gc.getTimestampView()
    gc.setupDate(date)
    for (let hour = 0; hour < 24; hour++) {
        let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
        gc.setupTime(hourOnTwoDigits + ':30')
        gc.timestampStatusShouldBe(created)
        gc.inputDataShouldBe(vulcanus, validated, filename, true)
    }
}