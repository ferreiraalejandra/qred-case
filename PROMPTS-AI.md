# AI assistance record

This records AI-assisted work on the case study.

## Prompt 1: Set up the project

> Create a TypeScript monorepo for the Qred case study using npm workspaces. Set up `apps/mobile` as an Expo/React Native app and `apps/api` as a Node.js/Express service. Add `packages/contract` for types and API schemas shared between them.
>
> Include a minimal runnable screen and API route so both apps can be started and checked. Add root scripts for starting the API and mobile app, running tests, and typechecking every workspace. Use strict TypeScript settings and add a `.gitignore` for dependencies, build output, environment files, and local databases.
>
> Write a README with prerequisites, installation and start commands, API URL configuration for a simulator or physical phone, and verification commands. Run the typechecks and tests, then report what passed and any setup assumptions.

## Prompt 2: Define the dashboard API contract

> Use the mobile dashboard image and these example data models to propose a contract API that lets frontend and backend development proceed in parallel:
>
> ```json
> {
>   "company": {
>     "id": "company_demo",
>     "name": "Qred Bank AB",
>     "organizationNumber": "559008-9800"
>   },
>   "card": {
>     "id": "card_demo",
>     "status": "inactive",
>     "provider": "visa"
>   },
>   "transactions": [
>     {
>       "id": "txn_1",
>       "merchant": "IKEA",
>       "amount": 900,
>       "currency": "SEK"
>     }
>   ],
>   "invoiceDue": {
>     "id": "invoice_demo",
>     "amount": 1200,
>     "currency": "SEK",
>     "dueDate": "2026-10-15T00:00:00.000Z"
>   }
> }
> ```
>
> Propose a `GET /api/v1/companies/:companyId/dashboard` response and Zod schemas with inferred TypeScript types in `packages/contract`. The dashboard should receive only the three latest transactions and a total count, rather than the full history. Use the image to identify any other data the screen needs, and list fields or business rules that need my decision instead of assuming them.
>
> **Before adding or changing any code, show me the proposed response shape, an example payload, and your open questions. Wait for my review and approval before implementing the contract or endpoint.**

## Prompt 3: Add SQLite storage

> Using the API contract approved in packages/contract/src/index.ts, propose a SQLite database schema for companies, cards, invoices, spend limits, and transactions. Show the tables, their relationships, and a suggested folder structure for the database code in the Express app.
>
> After my approval, add the SQLite dependency and implement database creation, SQL queries for the existing endpoints, and a first-run seed using the JSON data from contract development. Store transaction and invoice timestamps consistently in UTC. Update the README with the commands needed to run the database-backed API.
>
> **Before installing anything or changing any files, show me the proposed schema and folder structure. Wait for my review and approval before implementing them.**

## Prompt 4: Propose the frontend structure

> Using the approved API contract and the mobile dashboard image, propose a simple structure for the Expo app. Separate full pages, such as `Dashboard` and `Transactions`, from smaller reusable components like button, logo and transactionRow. Propose a container component that will eventually coordinate data and navigation, while pages and components receive the props and focus on rendering.
>
> For this first frontend step, use example data matching the shared contract to show how the pages and components fit together. Keep the pages and components presentational: they should render the data they receive and call the callbacks they are given, with **no API fetching yet**. This is only a starting point for the UI structure; API integration can follow separately.
>
> **Before changing any files, show me the proposed folder structure and the responsibility of each page, component, and container. Wait for my review and approval before implementing it.**

## Prompt 5: Connect the mobile app to the API

> Connect the frontend structure to the existing dashboard and transactions endpoints. Add `apps/mobile/src/api.ts` with fetch functions and validate responses with the shared Zod schemas.
>
> In `AppContainer`, replace the example data with these calls. Keep loading, error/retry, refresh and transaction pagination logic in the container, passing data to the pages. Pages and reusable components should continue to render props without making API calls. Run the mobile typecheck and lets start creating tests files for the components and containers with basic render tests.
>
> **Before changing any files, show me briefly how the data will flow from the API client through the container to the pages. Wait for my review and approval before implementing it.**

## Prompt 6: Organize the mobile styles

> The mobile UI works, but its styles are inline and repeated across pages and components. Propose a simpler style structure and folder layout that makes the code easier to read and maintain. Show what should be shared, like colors and typography, and what should live closer to each page or component in a `*.styles.ts` file.
>
> Keep the styling simple and consistent with the dashboard image, using the system font and no new font dependency. After my approval, move the styles into the agreed structure without changing the app's behavior, then run the mobile tests and typecheck.
>
> **Before changing any files, show me the proposed folder layout and a few examples of styles you would share or colocate. Wait for my review and approval before implementing it.**
