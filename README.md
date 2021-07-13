# GridCapa Acceptance Tests
[![MPL-2.0 License](https://img.shields.io/badge/license-MPL_2.0-blue.svg)](https://www.mozilla.org/en-US/MPL/2.0/)

This repository contains all the acceptance tests for GridCapa web application.
It uses Cypress to run automatic end-to-end tests of the entire application.

## Prerequisites

Acceptance tests run needs recent version of NodeJS.

## Building and running the tests

First load all the needed dependencies.

```bash
npm install
```

Then open the cypress UI.

```bash
npm test
```

Cypress opens in an Electron environment that let you run the acceptance tests on
any installed browser.
