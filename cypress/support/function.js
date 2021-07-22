export function runOnGridCapa(baseUrl, lambda) {
    connectToGridCapa(baseUrl);
    lambda();
    disconnectFromGridCapa();
}
export function authentication() {
    cy.get('button').click()
    cy.wait(1000)
}
export function getTimestampView() {
    cy.get('[data-test=timestamp-view]').click()
}
export function setupDateAndTime(date, time) {
    cy.get('[data-test=timestamp-date-picker]').type(date)
    cy.get('[data-test=timestamp-time-picker]').type(time)
}
function connectToGridCapa(baseUrl) {
    clearAndVisit(baseUrl)
}
function clearAndVisit(link) {
    cy.visit(link, {
        onBeforeLoad(win) {
            win.sessionStorage.clear()
        }
    })
    cy.url().should('be.equal', `${Cypress.config("baseUrl")}/cse/d2cc/`)
}
function disconnectFromGridCapa() {
    cy.get('button[aria-controls=settings-menu]').click()
    cy.get('#settings-menu :nth-child(7)').click()
}