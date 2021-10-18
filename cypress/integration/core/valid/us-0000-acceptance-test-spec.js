import * as gc from "../../../support/function";
import * as ftp from "../../../support/ftp-browser.js";

const ftpUser = Cypress.env('GRIDCAPA_FTP_USER');
const ftpPassword = Cypress.env('GRIDCAPA_FTP_PASSWORD');

describe('CGM automatic import handling', () => {
    it('Triggers one task creation when CGM archive with one CGM arrives', () => {
        gc.clearAndVisit('/core/valid')
        gc.authentication()
        gc.getTimestampView()
        gc.setupDateAndTime('2021-07-01', '14:30')
        cy.get('[data-test=timestamp-status]').should('have.text','Not created')
        cy.get('[data-test=input-type]').should("have.text","CGM")
        cy.get('[data-test=input-status]').should('have.text','Absent')
        cy.get('[data-test=input-filename]').should('be.empty')
        cy.get('[data-test=input-latest-modification]').should('be.empty')

        ftp.runOnFtp(ftpUser, ftpPassword, () => {
            ftp.copyFileToFtp('us-0000/20210701.zip', '/2021/07/01');
        });
        ftp.runOnFtp(ftpUser, ftpPassword, () => {
            ftp.deleteFileFromFtp('/2021/07/01/20210701.zip');
        });
    });
})
