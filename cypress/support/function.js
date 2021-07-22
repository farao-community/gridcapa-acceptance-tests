export function clearAndVisit(link) {
    cy.visit(link, {
        onBeforeLoad(win) {
            win.sessionStorage.clear()
        }
    })
}
export function authentication() {
    cy.wait(100)
    cy.get('button').click()
    cy.wait(100)
}
export function getTimestampView() {
    cy.get('[data-test=timestamp-view]').click()
}
export function setupDateAndTime(date, time) {
    cy.get('[data-test=timestamp-date-picker]').type(date)
    cy.get('[data-test=timestamp-time-picker]').type(time)
}