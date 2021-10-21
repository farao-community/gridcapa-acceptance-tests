const pathParser = require('path')
const gridCapaMinioPath = '/minio'

const timeoutProps = {timeout: 100000}

export function deleteObjectFromMinio(objectName) {
    cy.get('button[id*="obj-actions-' + objectName + '"]', timeoutProps).click()
    cy.get('ul[aria-labelledby*="' + objectName + '"] > a[title="Delete"]', timeoutProps).click()
    cy.get('.modal-footer > button').contains('Delete').click()
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
