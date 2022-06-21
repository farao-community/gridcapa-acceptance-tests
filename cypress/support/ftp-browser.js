/*
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import 'cypress-file-upload'

const FTP_HOST = Cypress.env('GRIDCAPA_FTP_HOST')
const FTP_USER = Cypress.env('GRIDCAPA_FTP_USER')
const FTP_PASSWORD = Cypress.env('GRIDCAPA_FTP_PASSWORD')
const FB_USER = Cypress.env('GRIDCAPA_FB_USER');
const FB_PASSWORD = Cypress.env('GRIDCAPA_FB_PASSWORD')
const FB_URL = '/utils/filebrowser'
const FB_FILES_URL = '/utils/filebrowser/files/ftp/'

// Process types to upload files on FTP
export const CSE_IMPORT_D2CC = 'cse/import/d2cc'
export const CSE_IMPORT_IDCC = 'cse/import/idcc'
export const CSE_EXPORT_D2CC = 'cse/export/d2cc'
export const CSE_EXPORT_IDCC = 'cse/export/idcc'
export const CORE_VALID = 'core/valid'

// File types to upload files on FTP
export const CGM = 'cgms'
export const CRAC = 'cracs'
export const GLSK = 'glsks'
export const NTC_RED = 'ntcreds'
export const NTC = 'ntc'
export const CBCORA = 'cbcoras'
export const REFPROG = 'refprogs'
export const STUDYPOINT = 'studypoints'

export function uploadFile(process, file, fileType) {
    uploadFiles(process, [file], [fileType])
}

export function uploadFiles(process, fileList, fileTypeList) {
    if (FTP_HOST) {
        for (let i = 0; i < fileList.length; i++) {
            uploadFileOnFtp(FTP_HOST, FTP_USER, FTP_PASSWORD, fileList[i], process + '/' + fileTypeList[i])
        }
    } else {
        runOnFb(FB_USER, FB_PASSWORD, () => {
            for (let i = 0; i < fileList.length; i++) {
                uploadFileOnFb(fileList[i], process + '/' + fileTypeList[i]);
            }
        });
    }
}

function uploadFileOnFtp(host, user, password, file, path) {
    const command = `curl --ftp-create-dirs -T cypress/fixtures/${file} ftp://${user}:${password}@${host}/${path}/`
    cy.exec(command, { timeout: 20000, failOnNonZeroExit: false, log: false })
}

function uploadFileOnFb(file, path) {
    cy.get('button').contains('My files').click()
    cy.get('button').contains('New folder').click()
    cy.get('.card-content > input[type=text]').type('/ftp/' + path)
    cy.get('button').contains('Create').click()
    cy.visit(FB_FILES_URL + path)

    cy.get('#upload-button').click()
    cy.get('#upload-input').attachFile({ filePath: file, encoding: 'base64' })
}

export function deleteProcessFolder(process) {
    if (FTP_HOST) {
        deleteOnFtp(FTP_HOST, FTP_USER, FTP_PASSWORD, process)
    } else {
        const elementPath = process.substring(0, process.lastIndexOf('/'))
        const element = process.substring(process.lastIndexOf('/') + 1)
        runOnFb(FB_USER, FB_PASSWORD, () => {
            deleteOnFb(elementPath, element);
        });
    }
}

function deleteOnFtp(host, user, password, file) {
    const command = `curl ftp://${user}:${password}@${host}/ -Q 'DELE ${file}'`
    cy.exec(command, { timeout: 20000, failOnNonZeroExit: false, log: false })
}

function deleteOnFb(elementPath, element) {
    cy.visit(FB_FILES_URL + elementPath)
    selectFileOnFb(element)
    deleteSelectedOnFb()
}

function selectFileOnFb(objectName) {
    cy.get('.item').contains(objectName).click({ ctrlKey: true })
}

function deleteSelectedOnFb() {
    cy.get('#delete-button').click()
    cy.get('.card-action').contains('Delete').click()
}

function runOnFb(user, password, lambda) {
    connectToFb(user, password);
    lambda();
    disconnectFromFb();
}

function connectToFb(user, password) {
    cy.visit(FB_URL)
    cy.get('input[type=text]').type(user, { log: false })
    cy.get('input[type=password]').type(password, { log: false })
    cy.get('input[type=submit]').click()
    cy.wait(100)
}

function disconnectFromFb() {
    cy.get('#logout').click()
}