# Qred Case

Expo/React Native dashboard and Node.js/Express API based on [`image.png`](image.png). The API reads from **SQLite**.

## Where to look

- `packages/contract/src/index.ts`: shared Zod response shapes for dashboard and transaction pages.
- `apps/api/schema.sql`: current SQLite tables for companies, cards, invoices, spend limits and transactions.
- `apps/api/data/demo.json`: example data inserted **only on first run** for a demo company.
- `apps/api/src/database.ts`, `seed.ts`, `dashboardDataSource.ts`, `app.ts`, `server.ts`: create the database, seed missing data, query it, expose HTTP routes and start the service.
- `apps/mobile/App.tsx`: entry point; mounts the app container.
- `apps/mobile/src/AppContainer.tsx`: all functional behaviour (requests, loading/retry/refresh state, navigation, which bottom sheet is open, support links).
- `apps/mobile/src/pages`: `Dashboard` and `Transactions`, the full destinations the user can land on.
- `apps/mobile/src/components`: reusable pieces drawn inside a page (`ActionButton`, `BrandLogo`, `TransactionRow`, `BottomSheet`).
- Both folders colocate a `*.styles.ts` per file, with shared tokens in `src/styles/colors.ts`, `typography.ts` (one system font, a small type scale) and `layout.ts` (screen frame, panel, row, feedback).
- `apps/mobile/src/**/*.test.tsx`: container tests with a mocked API next to `AppContainer`, unit tests next to each page and component.

## Run locally

Requires Node.js 20 and npm. From the repository root, install dependencies:

```sh
npm install
```

Start the API in one terminal (default port **3000**):

```sh
npm run api
```

Start the web app in another terminal:

```sh
EXPO_PUBLIC_API_URL=http://localhost:3000 npm run web
```

Open the web page at **http://localhost:8081**. `EXPO_PUBLIC_API_URL` points to the API, not to the web page. The API creates `apps/api/data/dashboard.sqlite` automatically; check `http://localhost:3000/api/v1/companies/company_demo/dashboard` to inspect its response.

If you want the API on **8082** instead, run `PORT=8082 npm run api` and `EXPO_PUBLIC_API_URL=http://localhost:8082 npm run web` in separate terminals. The web page still opens on **8081**. Always use the port printed by the API in `EXPO_PUBLIC_API_URL`.

The JSON fixture is a seed, not a live mock: editing it does **not** overwrite an already-seeded company. To start a fresh demo, stop the API, remove only `apps/api/data/dashboard.sqlite`, then restart. Alternatively set `DATABASE_PATH` to an absolute path for a different database. `apps/api/schema.sql` is the single current table definition; no legacy contract or migration files are needed for a fresh database. An older local `apps/api/data/qred.sqlite`, if present, is ignored by the running server. Database files are ignored by Git.

To start the mobile app, set `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` to an address the device can reach, then run:

```sh
npm run mobile
```

Use `http://localhost:<api-port>` for an iOS simulator, `http://10.0.2.2:<api-port>` for an Android emulator, or your computer's LAN IP for a physical phone. The project uses Expo SDK 52; Expo Go must support that SDK. Browser preview does not replace native-device review.

```sh
npm test
npm run typecheck
```

The example company identity is Qred Bank AB / org.nr 559008-9800. Card digits, invoices and purchases are **fictional**. Only the three latest purchases appear in the dashboard response; the full history is paged from the transactions endpoint. Logos fall back when unavailable. Card activation remains disabled pending an authorized mutation.
