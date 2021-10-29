/*
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const gridCapaMinioPath = '/minio'
const timeoutProps = {timeout: 5000}
const formattingLocal = 'en-US';

export function deleteFileFromMinio(folderPath, file) {
    cy.visit(gridCapaMinioPath + folderPath)
    selectFileFromMinio(file)
    deleteSelectedFromMinio()
}

export function deleteHourlyFilesFromMinio(folderPath, fileFormat) {
    cy.visit(gridCapaMinioPath + folderPath)
    for (let hour = 0; hour < 24; hour++) {
        let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
        selectFileFromMinio(fileFormat.format(hourOnTwoDigits))
    }
    deleteSelectedFromMinio()
}

export function deleteFolderFromMinio(folderName) {
    cy.get('button[id*="obj-actions-' + folderName + '"]', timeoutProps).click()
    cy.get('ul[aria-labelledby*="' + folderName + '"] > a[title="Delete"]', timeoutProps).click()
    cy.get('button').contains(/^Delete$/).click()
}

export function selectFileFromMinio(objectName) {
    cy.get('.fesl-item-name > a').contains(objectName).click()
}

export function deleteSelectedFromMinio() {
    cy.get('#delete-checked').click()
    cy.get('button').contains(/^Delete$/).click()
}

export function runOnMinio(user, password, lambda) {
    connectToMinio(user, password);
    lambda();
    disconnectFromMinio();
}

function connectToMinio(user, password) {
    cy.visit(gridCapaMinioPath + '/login')
    cy.get('#accessKey', timeoutProps).type(user)
    cy.get('#secretKey', timeoutProps).type(password)
    cy.get('button[type=submit]', timeoutProps).click()
    cy.wait(100)
}

function disconnectFromMinio() {
    cy.get('#top-right-menu', timeoutProps).click()
    cy.get('#logout', timeoutProps).click()
    cy.wait(100)
}
