import * as gc from "../support/function";
import * as ftp from "../support/ftp-browser.js";

const fbUser = Cypress.env('GRIDCAPA_FB_USER');
const fbPassword = Cypress.env('GRIDCAPA_FB_PASSWORD');

describe('CGM automatic import handling', () => {
    it('Triggers one task creation when CGM archive with one CGM arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        gc.getTimestampView()
        gc.setupDateAndTime('2021-07-01', '14:30')
        cy.get('[data-test=timestamp-status]').should('have.text','Not created')
        cy.get('[data-test=input-type]').should("have.text","CGM")
        cy.get('[data-test=input-status]').should('have.text','Absent')
        cy.get('[data-test=input-filename]').should('be.empty')
        cy.get('[data-test=input-latest-modification]').should('be.empty')

        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyFileToFtp('us-0000/20210701.zip', '/2021/07/01');
        });
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/2021/07/01/20210701.zip');
        });
    });
})
