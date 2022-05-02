/*
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const pathParser = require('path')
const gridCapaMinioPath = '/minio'
const timeoutProps = {timeout: 10000}
const formattingLocal = 'en-US';
const perFileDeletionWaitingDelay = 200;
const waitForBigDeletion = 5000

export function deleteFileFromMinio(folderPath, file) {
    cy.visit(gridCapaMinioPath + folderPath)
    selectFileFromMinio(file)
    deleteSelectedFromMinio()
}

export function deleteFilesFromMinio(fileList) {
    let filesByFolder = new Map()
    for (let file of fileList) {
        let fileDirName = pathParser.dirname(file)
        let fileBaseName = pathParser.basename(file)
        if (filesByFolder.has(fileDirName)) {
            filesByFolder.get(fileDirName).push(fileBaseName)
        } else {
            filesByFolder.set(fileDirName, [fileBaseName])
        }
    }
    for (let [folderPath, filesInFolder] of filesByFolder) {
        deleteFilesInFolderFromMinio(folderPath + '/', filesInFolder)
    }
}

function deleteFilesInFolderFromMinio(folderPath, filelist) {
    cy.visit(gridCapaMinioPath + folderPath)
    for (let file of filelist) {
        selectFileFromMinio(file)
    }
    deleteSelectedFromMinio()
    cy.wait(filelist.length * perFileDeletionWaitingDelay)
}

export function deleteHourlyFilesFromMinio(folderPath, fileFormat) {
    cy.visit(gridCapaMinioPath + folderPath)
    for (let hour = 0; hour < 24; hour++) {
        let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
        selectFileFromMinio(fileFormat.format(hourOnTwoDigits))
    }
    deleteSelectedFromMinio()
    cy.wait(waitForBigDeletion)
}

export function deleteFolderFromMinio(folderPath, folderName) {
    cy.visit(gridCapaMinioPath + folderPath)
    cy.get('button[id*="obj-actions-' + folderName + '"]', timeoutProps).click()
    cy.get('ul[aria-labelledby*="' + folderName + '"] > a[title="Delete"]', timeoutProps).click()
    cy.get('button').contains(/^Delete$/).click()
    cy.wait(waitForBigDeletion)
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
    cy.get('#accessKey', timeoutProps).type(user, { log: false })
    cy.get('#secretKey', timeoutProps).type(password, { log: false })
    cy.get('button[type=submit]', timeoutProps).click()
    cy.wait(100)
}

function disconnectFromMinio() {
    cy.get('#top-right-menu', timeoutProps).click()
    cy.get('#logout', timeoutProps).click()
    cy.wait(100)
}

String.prototype.format = function() {
    let args = arguments;
    return this.replace(/\{(\d+)\}/g, function(a, num){
        return args[num] || a
    })
}