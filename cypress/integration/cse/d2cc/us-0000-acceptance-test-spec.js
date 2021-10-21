import * as gc from "../../../support/function";
import * as ftp from "../../../support/ftp-browser.js";
import * as minio from "../../../support/minio.js";

const fbUser = Cypress.env('GRIDCAPA_FB_USER');
const fbPassword = Cypress.env('GRIDCAPA_FB_PASSWORD')
const minioUser = Cypress.env('GRIDCAPA_MINIO_USER');
const minioPassword = Cypress.env('GRIDCAPA_MINIO_PASSWORD')

const formattingLocal = 'en-US';

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('CGM automatic import handling', () => {
    it('Triggers one task creation when CGM archive with one CGM arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        gc.getTimestampView()
        gc.setupDateAndTime('2021-07-01', '14:30')
        gc.timestampStatusShouldBe('NOT_CREATED')
        gc.inputDataShouldBe('CGM', 'NOT_PRESENT', null, null)
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyFileToFtp('us-0000/20210701.zip', '/cse/d2cc/cgms');
        });
        cy.visit('/cse/d2cc')
        gc.getTimestampView()
        gc.setupDateAndTime('2021-07-01', '14:30')
        gc.inputDataShouldBe('CGM', 'VALIDATED', '20210701_1430_2D4_UX0.uct', null)
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/cse/d2cc/cgms/20210701.zip');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            minio.deleteFileFromMinio('gridcapa', '/CSE/D2CC/CGMs/20210701_1430_2D4_UX0.uct')
        })
    });

    it('Triggers multiple task creation when CGM archive with multiple CGM arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        gc.getTimestampView()
        for (let hour = 0; hour < 24; hour++) {
            let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
            gc.setupDateAndTime('2021-07-02', hourOnTwoDigits + ':30')
            gc.timestampStatusShouldBe('NOT_CREATED')
            gc.inputDataShouldBe('CGM', 'NOT_PRESENT', null, null)
        }
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyFileToFtp('us-0000/20210702.zip', '/cse/d2cc/cgms');
        });
        for (let hour = 0; hour < 24; hour++) {
            let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
            cy.visit('/cse/d2cc')
            gc.getTimestampView()
            gc.setupDateAndTime('2021-07-02', hourOnTwoDigits + ':30')
            gc.timestampStatusShouldBe('NOT_CREATED')
            gc.inputDataShouldBe('CGM', 'VALIDATED', '20210702_' + hourOnTwoDigits + '30_2D5_UX0.uct', null)
        }
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/cse/d2cc/cgms/20210702.zip');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            for (let hour = 0; hour < 24; hour++) {
                let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
                minio.deleteFileFromMinio('gridcapa', '/CSE/D2CC/CGMs/20210702_' + hourOnTwoDigits + '30_2D5_UX0.uct')
            }
        })
    });

    it('Triggers no task creation when CGM archive is empty', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        gc.getTimestampView()
        gc.setupDateAndTime('2021-07-03', '00:30')
        gc.timestampStatusShouldBe('NOT_CREATED')
        gc.inputDataShouldBe('CGM', 'NOT_PRESENT', null, null)
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyFileToFtp('us-0000/20210703.zip', '/cse/d2cc/cgms');
        });
        cy.visit('/cse/d2cc')
        gc.getTimestampView()
        gc.setupDateAndTime('2021-07-03', '00:30')
        gc.inputDataShouldBe('CGM', 'NOT_PRESENT', null, null)
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/cse/d2cc/cgms/20210703.zip');
        });
    });

    it('Triggers multiple task creation when CGM archive with multiple CGM and no zip extension arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        gc.getTimestampView()
        for (let hour = 0; hour < 24; hour++) {
            let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
            gc.setupDateAndTime('2021-07-02', hourOnTwoDigits + ':30')
            gc.timestampStatusShouldBe('NOT_CREATED')
            gc.inputDataShouldBe('CGM', 'NOT_PRESENT', null, null)
        }
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyFileToFtp('us-0000/20210702', '/cse/d2cc/cgms');
        });
        for (let hour = 0; hour < 24; hour++) {
            let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
            cy.visit('/cse/d2cc')
            gc.getTimestampView()
            gc.setupDateAndTime('2021-07-02', hourOnTwoDigits + ':30')
            gc.timestampStatusShouldBe('NOT_CREATED')
            gc.inputDataShouldBe('CGM', 'VALIDATED', '20210702_' + hourOnTwoDigits + '30_2D5_UX0.uct', null)
        }
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/cse/d2cc/cgms/20210702.zip');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            for (let hour = 0; hour < 24; hour++) {
                let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
                minio.deleteFileFromMinio('gridcapa', '/CSE/D2CC/CGMs/20210702_' + hourOnTwoDigits + '30_2D5_UX0.uct')
            }
        })
    });

    it('Triggers multiple task creation when CGM archive with multiple CGM and subdirectories arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        gc.getTimestampView()
        for (let hour = 0; hour < 24; hour++) {
            let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
            gc.setupDateAndTime('2021-07-02', hourOnTwoDigits + ':30')
            gc.timestampStatusShouldBe('NOT_CREATED')
            gc.inputDataShouldBe('CGM', 'NOT_PRESENT', null, null)
        }
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyFileToFtp('us-0000/20210702_sub_dir.zip', '/cse/d2cc/cgms');
        });
        for (let hour = 0; hour < 24; hour++) {
            let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
            cy.visit('/cse/d2cc')
            gc.getTimestampView()
            gc.setupDateAndTime('2021-07-02', hourOnTwoDigits + ':30')
            gc.timestampStatusShouldBe('NOT_CREATED')
            gc.inputDataShouldBe('CGM', 'VALIDATED', '20210702_' + hourOnTwoDigits + '30_2D5_UX0.uct', null)
        }
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/cse/d2cc/cgms/20210702.zip');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            for (let hour = 0; hour < 24; hour++) {
                let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
                minio.deleteFileFromMinio('gridcapa', '/CSE/D2CC/CGMs/20210702_' + hourOnTwoDigits + '30_2D5_UX0.uct')
            }
        })
    });
})
