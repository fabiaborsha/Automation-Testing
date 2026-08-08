# Automation Testing Assessment

UI automation for SauceDemo and API automation for ReqRes using Playwright and TypeScript.

## Tech stack

- Playwright
- TypeScript
- Node.js
- ReqRes API

## Project structure

```text
automation-assessment/
├── tests/
│   ├── ui/
│   │   └── saucedemo.spec.ts
│   └── api/
│       └── reqres.spec.ts
├── .env.example
├── .gitignore
├── package.json
├── playwright.config.ts
└── README.md
```

## Setup

Install Node.js LTS first.

Then open the project in VS Code and run:

```bash
npm install
npx playwright install
```

Copy `.env.example` to `.env` and add your ReqRes API key:

```env
REQRES_API_KEY=your_reqres_api_key_here
```

Do not commit `.env`.

## Run all tests

```bash
npx playwright test
```

## Run UI tests

```bash
npx playwright test tests/ui
```

Run UI tests with the browser visible:

```bash
npx playwright test tests/ui --headed
```

## Run API tests

```bash
npx playwright test tests/api
```

## Run a single question

Examples:

```bash
npx playwright test tests/ui -g "Q1"
npx playwright test tests/ui -g "Q2"
npx playwright test tests/ui -g "Q3"
npx playwright test tests/api -g "Q3"
npx playwright test tests/api -g "Q4"
npx playwright test tests/api -g "Q5"
npx playwright test tests/api -g "Q6"
npx playwright test tests/api -g "Q8"
```

## View HTML report

After running tests:

```bash
npx playwright show-report
```

## Assessment coverage

### UI

- Q1: locked_out_user login and error message
- Q2: standard_user, reset state, add three products, verify names and total, complete order, reset and logout
- Q3: performance_glitch_user, reset state, Z-A sorting, first product checkout, verify name and total, complete order, reset and logout

### API

- Q3: login and capture auth token
- Q4: GET user and verify name/email
- Q5: PUT profile and verify updatedAt
- Q6: PATCH one field
- Q8: negative requests and 4xx validation
