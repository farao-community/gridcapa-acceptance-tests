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
        gc.setupDate('2021-07-01')
        gc.setupTime('14:30')
        gc.timestampStatusShouldBe('NOT_CREATED')
        gc.inputDataShouldBe('CGM', 'NOT_PRESENT', null, null)
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyZipToFtp('us-0000/20210701.zip', '/cse/d2cc/cgms');
        });
        cy.visit('/cse/d2cc')
        gc.getTimestampView()
        gc.setupDate('2021-07-01')
        gc.setupTime('14:30')
        gc.inputDataShouldBe('CGM', 'VALIDATED', '20210701_1430_2D4_UX0.uct', '')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/cse/d2cc/cgms/20210701.zip', 'base64');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            cy.visit('/minio/gridcapa/')
            minio.deleteObjectFromMinio('TESTS')
        })
    });

    it('Triggers multiple task creation when CGM archive with multiple CGM arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        gc.getTimestampView()
        gc.setupDate('2021-07-02')
        for (let hour = 0; hour < 24; hour++) {
            let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
            gc.setupTime(hourOnTwoDigits + ':30')
            gc.timestampStatusShouldBe('NOT_CREATED')
            gc.inputDataShouldBe('CGM', 'NOT_PRESENT', null, null)
        }
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyZipToFtp('us-0000/20210702.zip', '/cse/d2cc/cgms');
        });
        cy.visit('/cse/d2cc')
        gc.getTimestampView()
        gc.setupDate('2021-07-02')
        for (let hour = 0; hour < 24; hour++) {
            let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
            gc.setupTime(hourOnTwoDigits + ':30')
            gc.timestampStatusShouldBe('CREATED')
            gc.inputDataShouldBe('CGM', 'VALIDATED', '20210702_' + hourOnTwoDigits + '30_2D5_UX0.uct', '')
        }
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/cse/d2cc/cgms/20210702.zip');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            cy.visit('/minio/gridcapa/')
            minio.deleteObjectFromMinio('TESTS')
        })
    });

    it('Triggers no task creation when CGM archive is empty', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        gc.getTimestampView()
        gc.setupDate('2021-07-03')
        gc.setupTime('00:30')
        gc.timestampStatusShouldBe('NOT_CREATED')
        gc.inputDataShouldBe('CGM', 'NOT_PRESENT', null, null)
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyZipToFtp('us-0000/20210703.zip', '/cse/d2cc/cgms');
        });
        cy.visit('/cse/d2cc')
        gc.getTimestampView()
        gc.setupDate('2021-07-03')
        gc.setupTime('00:30')
        gc.inputDataShouldBe('CGM', 'NOT_PRESENT', null, null)
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/cse/d2cc/cgms/20210703.zip');
        });
    });

    it('Triggers multiple task creation when CGM archive with multiple CGM and no zip extension arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        gc.getTimestampView()
        gc.setupDate('2021-07-02')
        for (let hour = 0; hour < 24; hour++) {
            let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
            gc.setupTime(hourOnTwoDigits + ':30')
            gc.timestampStatusShouldBe('NOT_CREATED')
            gc.inputDataShouldBe('CGM', 'NOT_PRESENT', null, null)
        }
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyZipToFtp('us-0000/20210702', '/cse/d2cc/cgms');
        });
        cy.visit('/cse/d2cc')
        gc.getTimestampView()
        gc.setupDate('2021-07-02')
        for (let hour = 0; hour < 24; hour++) {
            let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
            gc.setupTime(hourOnTwoDigits + ':30')
            gc.timestampStatusShouldBe('CREATED')
            gc.inputDataShouldBe('CGM', 'VALIDATED', '20210702_' + hourOnTwoDigits + '30_2D5_UX0.uct', '')
        }
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/cse/d2cc/cgms/20210702');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            cy.visit('/minio/gridcapa/')
            minio.deleteObjectFromMinio('TESTS')
        })
    });

    it('Triggers multiple task creation when CGM archive with multiple CGM and subdirectories arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        gc.getTimestampView()
        gc.setupDate('2021-07-02')
        for (let hour = 0; hour < 24; hour++) {
            let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
            gc.setupTime(hourOnTwoDigits + ':30')
            gc.timestampStatusShouldBe('NOT_CREATED')
            gc.inputDataShouldBe('CGM', 'NOT_PRESENT', null, null)
        }
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyZipToFtp('us-0000/20210702_sub_dir.zip', '/cse/d2cc/cgms');
        });
        cy.visit('/cse/d2cc')
        gc.getTimestampView()
        gc.setupDate('2021-07-02')
        for (let hour = 0; hour < 24; hour++) {
            let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
            gc.getTimestampView()
            gc.setupTime(hourOnTwoDigits + ':30')
            gc.timestampStatusShouldBe('CREATED')
            gc.inputDataShouldBe('CGM', 'VALIDATED', '20210702_' + hourOnTwoDigits + '30_2D5_UX0.uct', '')
        }
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/cse/d2cc/cgms/20210702_sub_dir.zip');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            cy.visit('/minio/gridcapa/')
            minio.deleteObjectFromMinio('TESTS')
        })
    });

    it('Triggers a task creation when a bare CGM file arrives', () => {
        gc.clearAndVisit('/cse/d2cc')
        gc.authentication()
        gc.getTimestampView()
        gc.setupDate('2021-07-02')
        for (let hour = 0; hour < 24; hour++) {
            let hourOnTwoDigits = hour.toLocaleString(formattingLocal, {minimumIntegerDigits: 2, useGrouping:false})
            gc.setupTime(hourOnTwoDigits + ':30')
            gc.timestampStatusShouldBe('NOT_CREATED')
            gc.inputDataShouldBe('CGM', 'NOT_PRESENT', null, null)
        }
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.copyFileToFtp('us-0000/20210702_2330_2D5_UX0.uct', '/cse/d2cc/cgms');
        });
        cy.visit('/cse/d2cc')
        gc.getTimestampView()
        gc.setupDate('2021-07-02')
        gc.setupTime('23:30')
        gc.timestampStatusShouldBe('CREATED')
        gc.inputDataShouldBe('CGM', 'VALIDATED', '20210702_2330_2D5_UX0.uct', '')
        ftp.runOnFtp(fbUser, fbPassword, () => {
            ftp.deleteFileFromFtp('/cse/d2cc/cgms/20210702_2330_2D5_UX0.uct');
        });
        minio.runOnMinio(minioUser, minioPassword, () => {
            cy.visit('/minio/gridcapa/')
            minio.deleteObjectFromMinio('TESTS')
        })
    });
})
