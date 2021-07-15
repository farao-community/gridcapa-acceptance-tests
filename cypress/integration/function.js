export function clearAndVisit(link) {
    cy.visit(link, {
        onBeforeLoad(win) {
            win.sessionStorage.clear()
        }
    })
}
export function authentication() {
    cy.get('button').click()
}
export function getTimestampView() {
    cy.get('[data-test=timestamp-view]').click()
}
export function setupDateAndTime(date, time) {
    cy.get('input[type=date]').type(date)
    cy.get('input[type=time]').type(time)
}