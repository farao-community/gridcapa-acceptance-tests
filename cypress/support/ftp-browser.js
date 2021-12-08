/*
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import 'cypress-file-upload'

const pathParser = require('path')
const gridCapaFilebrowserPath = '/utils/filebrowser'
const ftpHost = Cypress.env('GRIDCAPA_FTP_HOST')
const ftpUser = Cypress.env('GRIDCAPA_FTP_USER')
const ftpPassword = Cypress.env('GRIDCAPA_FTP_PASSWORD')
const ftpRootDirectory = 'cse/d2cc/'
export const fbUser = Cypress.env('GRIDCAPA_FB_USER');
export const fbPassword = Cypress.env('GRIDCAPA_FB_PASSWORD')
const fbRootDirectoryForCseD2cc = '/ftp/cse/d2cc/'

export function uploadOnFtp(file, path) {
    if (ftpHost) {
        uploadOnFtpByCommand(ftpHost, ftpUser, ftpPassword, file, ftpRootDirectory + path)
    } else {
        runOnFtp(fbUser, fbPassword, () => {
            copyZipToFtp(file, fbRootDirectoryForCseD2cc + path);
        });
    }
}

export function deleteOnFtp(file) {
    if (ftpHost) {
        deleteOnFtpByCommand(ftpHost, ftpUser, ftpPassword, ftpRootDirectory + file)
    } else {
        runOnFtp(fbUser, fbPassword, () => {
            deleteFileFromFtp(fbRootDirectoryForCseD2cc + file);
        });
    }
}
export function uploadOnFtpByCommand(host, user, password, file, path) {
    const command = `curl --ftp-create-dirs -T cypress/fixtures/${file} ftp://${user}:${password}@${host}/${path}/`
    cy.log('Running: ' + command);
    cy.exec(
        command,
        { timeout: 20000, failOnNonZeroExit: false }
    )
}

export function deleteOnFtpByCommand(host, user, password, file) {
    const command = `curl ftp://${user}:${password}@${host}/ -Q 'DELE ${file}'`
    cy.exec(
        command,
        { timeout: 20000, failOnNonZeroExit: false }
    )
}

export function copyZipToFtp(file, path) {
    copyFileToFtp(file, path, 'base64')
}

export function copyFileToFtp(file, path, encoding) {
    cy.get('button').contains('New folder').click()
    cy.get('.card-content > input[type=text]').type(path)
    cy.get('button').contains('Create').click()
    cy.visit(gridCapaFilebrowserPath + '/files' + path)

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
    cy.visit(gridCapaFilebrowserPath + '/files' + fileDir)
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
