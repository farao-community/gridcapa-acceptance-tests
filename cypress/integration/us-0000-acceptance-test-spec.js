describe('CGM automatic import handling', () => {
    function clearAndVisit(link) {
        cy.visit(link, {
            onBeforeLoad(win) {
                win.sessionStorage.clear()
            }
        })
    }
    function authentication() {
        cy.get('button').click()
    }
    function getTimestampView() {
        cy.get('[data-test=timestamp-view]').click()
        cy.get('[data-test=timestamp-view-tab]')
    }

    it('Triggers one task creation when CGM archive with one CGM arrives', () => {
        clearAndVisit('/cse/d2cc');
        authentication();
        getTimestampView();
    });
})
