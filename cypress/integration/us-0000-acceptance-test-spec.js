import {authentication, clearAndVisit, getTimestampView, setupDateAndTime} from "./function";

describe('CGM automatic import handling', () => {


    it('Triggers one task creation when CGM archive with one CGM arrives', () => {
        clearAndVisit('/cse/d2cc')
        authentication()
        getTimestampView()
        setupDateAndTime('2021-07-01', '14:30')
        cy.get('[data-test=timestamp-status]').should('have.text','Not created')
        cy.get('[data-test=input-type]').should("have.text","CGM")
        cy.get('[data-test=file-status]').should('have.text','Absent')
        cy.get('[data-test=filename]').should('be.empty')
        cy.get('[data-test=message]').should('be.empty')
    });
})
