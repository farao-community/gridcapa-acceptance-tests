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
const perFileDeletionWaitingDelay = 200;
export const fbUser = Cypress.env('GRIDCAPA_FB_USER');
export const fbPassword = Cypress.env('GRIDCAPA_FB_PASSWORD')
const fbRootDirectoryForCseD2cc = '/ftp/cse/d2cc/'
const ftpRootDirectoryForCseD2cc = 'cse/d2cc/'
const fbRootDirectoryForCoreValid = '/ftp/core/valid/'
const ftpRootDirectoryForCoreValid = 'core/valid/'

export function uploadOnFtp(process, file, path) {
    let fbRootDirectory = getFbRootDirectory(process);
    if (ftpHost) {
        uploadOnFtpByCommand(ftpHost, ftpUser, ftpPassword, file, fbRootDirectory + path)
    } else {
        runOnFtp(fbUser, fbPassword, () => {
            copyZipToFtp(file, fbRootDirectory + path);
        });
    }
    cy.wait(500);
}

export function deleteFilesFromFtp(fileList) {
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
        deleteFilesInFolderFromFtp(folderPath, filesInFolder)
    }
}

export function deleteOnFtp(process, file) {
    let ftpRootDirectory = getFtpRootDirectory(process);
    let fbRootDirectory = getFbRootDirectory(process);
    if (ftpHost) {
        deleteOnFtpByCommand(ftpHost, ftpUser, ftpPassword, ftpRootDirectory + file)
    } else {
        runOnFtp(fbUser, fbPassword, () => {
            deleteFilesFromFtp([fbRootDirectory + file]);
        });
    }
}

export function uploadOnFtpByCommand(host, user, password, file, path) {
    const command = `curl --ftp-create-dirs -T cypress/fixtures/${file} ftp://${user}:${password}@${host}/${path}/`
    cy.exec(
        command,
        { timeout: 20000, failOnNonZeroExit: false, log: false }
    )
}

export function deleteOnFtpByCommand(host, user, password, file) {
    const command = `curl ftp://${user}:${password}@${host}/ -Q 'DELE ${file}'`
    cy.exec(
        command,
        { timeout: 20000, failOnNonZeroExit: false, log: false }
    )
}

export function copyZipToFtp(file, path) {
    copyFileToFtp(file, path, 'base64')
}

export function copyFileToFtp(file, path, encoding) {
    cy.get('button').contains('My files').click()
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
    cy.wait(500);
}

function deleteFilesInFolderFromFtp(folderPath, filelist) {
    cy.visit(gridCapaFilebrowserPath + '/files' + folderPath)
    for (let file of filelist) {
        selectFileFromFtp(file)
    }
    deleteSelectedFromFtp()
    cy.wait(filelist.length * perFileDeletionWaitingDelay)
}

export function selectFileFromFtp(objectName) {
    cy.get('.item').contains(objectName).click({
        ctrlKey: true,
    })
}

export function deleteSelectedFromFtp() {
    cy.get('#delete-button').click()
    cy.get('.card-action').contains('Delete').click()
    cy.wait(500);
}

export function runOnFtp(user, password, lambda) {
    connectToFtpBrowser(user, password);
    lambda();
    disconnectFromFtpBrowser();
}

function connectToFtpBrowser(user, password) {
    cy.visit(gridCapaFilebrowserPath)
    cy.get('input[type=text]').type(user, { log: false })
    cy.get('input[type=password]').type(password, { log: false })
    cy.get('input[type=submit]').click()
    cy.wait(200)
}

function disconnectFromFtpBrowser() {
    cy.get('#logout').click()
    cy.wait(200)
}

function getFbRootDirectory(process) {
    if (process === "CORE_VALID") {
        return fbRootDirectoryForCoreValid
    } else if (process === "CSE_D2CC") {
        return fbRootDirectoryForCseD2cc
    } else {
        return fbRootDirectoryForCseD2cc; // CSE D2cc by default
    }
}

function getFtpRootDirectory(process) {
    if (process === "CORE_VALID") {
        return ftpRootDirectoryForCoreValid
    } else if (process === "CSE_D2CC") {
        return ftpRootDirectoryForCseD2cc
    } else {
        return ftpRootDirectoryForCseD2cc; // CSE D2cc by default
    }
}