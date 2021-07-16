const pathParser = require('path');
const gridCapaFtpBrowserPath = '/utils/filebrowser';

export function copyFileToFtp(file, path) {
    cy.get('button').contains('New folder').click()
    cy.get('.card-content > input[type=text]').type(path)
    cy.get('button').contains('Create').click()
    cy.visit(gridCapaFtpBrowserPath + '/files' + path)

    cy.get('#upload-button').click()
    cy.get('#upload-input').attachFile(file)
}

export function deleteFileFromFtp(fileFullPath) {
    let fileDir = pathParser.dirname(fileFullPath);
    let fileName = pathParser.basename(fileFullPath);
    cy.visit(gridCapaFtpBrowserPath + '/files' + fileDir)
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
    cy.visit(gridCapaFtpBrowserPath)
    cy.get('input[type=text]').type(user)
    cy.get('input[type=password]').type(password)
    cy.get('input[type=submit]').click()
}

function disconnectFromFtpBrowser() {
    cy.get('#logout').click()
}
