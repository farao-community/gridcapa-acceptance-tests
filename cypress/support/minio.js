/*
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const MINIO_USER = Cypress.env('GRIDCAPA_MINIO_USER');
const MINIO_PASSWORD = Cypress.env('GRIDCAPA_MINIO_PASSWORD')
const MINIO_URL = '/minio'
const TIMEOUT_PROPS = {timeout: 10000}

export const CSE_IMPORT_D2CC = ['/gridcapa/CSE/IMPORT/', 'D2CC']
export const CSE_IMPORT_IDCC = ['/gridcapa/CSE/IMPORT/', 'IDCC']
export const CSE_EXPORT_D2CC = ['/gridcapa/CSE/EXPORT/', 'D2CC']
export const CSE_EXPORT_IDCC = ['/gridcapa/CSE/EXPORT/', 'IDCC']
export const CORE_VALID = ['/gridcapa/CORE/', 'VALID']

export function deleteFileFromMinio(folderPath, file) {
    cy.visit(MINIO_URL + folderPath)
    selectFileFromMinio(file)
    deleteSelectedFromMinio()
}

// Process must be part of the elements defined at the top of the file
export function deleteProcessFolder(process) {
    deleteFolderFromMinio(process[0], process[1])
}

export function deleteFolderFromMinio(folderPath, folderName) {
    cy.visit(MINIO_URL + folderPath)
    cy.get('button[id*="obj-actions-' + folderName + '/"]', TIMEOUT_PROPS).click()
    cy.get('ul[aria-labelledby*="' + folderName + '/"] > a[title="Delete"]', TIMEOUT_PROPS).click()
    cy.get('button', TIMEOUT_PROPS).contains(/^Delete$/).click()
}

export function selectFileFromMinio(objectName) {
    cy.get('.fesl-item-name > a', TIMEOUT_PROPS).contains(objectName).click()
}

export function deleteSelectedFromMinio() {
    cy.get('#delete-checked', TIMEOUT_PROPS).click()
    cy.get('button', TIMEOUT_PROPS).contains(/^Delete$/).click()
}

export function runOnMinio(lambda) {
    connectToMinio();
    lambda();
    disconnectFromMinio();
}

function connectToMinio() {
    cy.intercept(MINIO_URL + '/webrpc').as('minioLogin')
    cy.visit(MINIO_URL + '/login')
    cy.get('#accessKey', TIMEOUT_PROPS).type(MINIO_USER, { log: false })
    cy.get('#secretKey', TIMEOUT_PROPS).type(MINIO_PASSWORD, { log: false })
    cy.get('button[type=submit]', TIMEOUT_PROPS).click()
    cy.wait('@minioLogin') // It waits for login to be fulfilled before going next step
}

function disconnectFromMinio() {
    // Force because sometimes modal for deletion remains a bit and hides logout buttons
    cy.get('#top-right-menu', TIMEOUT_PROPS).click({ force: true })
    cy.get('#logout', TIMEOUT_PROPS).click({ force: true })
}