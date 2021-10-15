import 'cypress-file-upload'

const pathParser = require('path')
const gridCapaFilebrowserPath = '/utils/filebrowser'
const gridCapaFtpSubPath = '/ftp'

export function copyFileToFtp(file, path) {
    cy.get('button').contains('New folder').click()
    cy.get('.card-content > input[type=text]').type(gridCapaFtpSubPath + path)
    cy.get('button').contains('Create').click()
    cy.visit(gridCapaFilebrowserPath + '/files' + gridCapaFtpSubPath + path)

    cy.get('#upload-button').click()
    cy.get('#upload-input').attachFile(file)
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
    cy.wait(100)
}

function disconnectFromFtpBrowser() {
    cy.get('#logout').click()
    cy.wait(100)
}
