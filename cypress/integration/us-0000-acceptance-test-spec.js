import 'cypress-file-upload';
import * as ftp from "../support/ftp-browser.js";

const ftpUser = Cypress.env('GRIDCAPA_FTP_USER');
const ftpPassword = Cypress.env('GRIDCAPA_FTP_PASSWORD');

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
        ftp.runOnFtp(ftpUser, ftpPassword, () => {
            ftp.copyFileToFtp('us-0000/20210701.zip', '/2021/07/01');
        });
        ftp.runOnFtp(ftpUser, ftpPassword, () => {
            ftp.deleteFileFromFtp('/2021/07/01/20210701.zip');
        });
    });
})
