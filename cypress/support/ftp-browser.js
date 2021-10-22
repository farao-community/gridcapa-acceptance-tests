/*
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import 'cypress-file-upload'

const pathParser = require('path')
const gridCapaFilebrowserPath = '/utils/filebrowser'
const gridCapaFtpSubPath = '/ftp'

export function copyZipToFtp(file, path) {
    copyFileToFtp(file, path, 'base64')
}

export function copyFileToFtp(file, path, encoding) {
    cy.get('button').contains('New folder').click()
    cy.get('.card-content > input[type=text]').type(gridCapaFtpSubPath + path)
    cy.get('button').contains('Create').click()
    cy.visit(gridCapaFilebrowserPath + '/files' + gridCapaFtpSubPath + path)

    cy.get('#upload-button').click()
    if (encoding === undefined) {
        cy.get('#upload-input').attachFile(file)
    } else {
        cy.get('#upload-input').attachFile({ filePath: file, encoding: encoding })
    }
}

export function deleteFileFromFtp(fileFullPath) {
    let fileDir = pathParser.dirname(fileFullPath)
    let fileName = pathParser.basename(fileFullPath)
    cy.visit(gridCapaFilebrowserPath + '/files' + gridCapaFtpSubPath + fileDir)
    cy.get('.item').contains(fileName).click()
    cy.get('#delete-button').click()
    cy.get('.card-action').contains('Delete').click()
}

export function runOnFtp(user, password, lambda) {
    connectToFtpBrowser(user, password);
    lambda();
    disconnectFromFtpBrowser();
}

function connectToFtpBrowser(user, password) {
    cy.visit(gridCapaFilebrowserPath)
    cy.get('input[type=text]').type(user)
    cy.get('input[type=password]').type(password)
    cy.get('input[type=submit]').click()
    cy.wait(200)
}

function disconnectFromFtpBrowser() {
    cy.get('#logout').click()
    cy.wait(200)
}
