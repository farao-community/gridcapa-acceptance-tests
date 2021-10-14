const pathParser = require('path')
const gridCapaMinioPath = '/minio'

export function deleteFileFromMinio(bucket, objectKey) {
    let objectDir = pathParser.dirname(objectKey)
    let objectName = pathParser.basename(objectKey)
    cy.visit(gridCapaMinioPath + '/' + bucket + objectDir + '/')
    cy.get('.fesl-item-name > a').contains(objectName).click()
    cy.get('#delete-checked').click()
    cy.get('.modal-footer > button').contains('Delete').click()
}

export function runOnMinio(user, password, lambda) {
    connectToMinio(user, password);
    lambda();
    disconnectFromMinio();
}

function connectToMinio(user, password) {
    cy.visit(gridCapaMinioPath + '/login')
    cy.get('#accessKey').type(user)
    cy.get('#secretKey').type(password)
    cy.get('button[type=submit]').click()
    cy.wait(100)
}

function disconnectFromMinio() {
    cy.get('#top-right-menu').click()
    cy.get('#logout').click()
    cy.wait(100)
}
