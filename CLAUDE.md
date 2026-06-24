# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server (localhost:3000)
npm run build      # Production build
npm test           # Run tests (React Testing Library / Jest)
npm test -- --testPathPattern=<filename>  # Run a single test file
```

### Deployment

```bash
bash deploy.sh       # Build and deploy to dev server
bash deploy_prod.sh  # Build and deploy to production server
```

Both scripts mutate `.env` with `sed` before building and SCP the `build/` directory to the Ubuntu server via `mandi-server-curr.pem`.

## Environment Variables

```
REACT_APP_API_URL   # Backend base URL (e.g. http://52.66.145.64:8080/mandi/)
REACT_APP_PASS      # App login password (4-digit PIN)
```

The axios instance in [src/interceptors/error-handling-interceptor.js](src/interceptors/error-handling-interceptor.js) reads `REACT_APP_API_URL` via `src/constants/config.js` and attaches `deviceId` from `localStorage` to every request header.

## Architecture

### Data Flow (Offline-First)

This app is offline-first. Transactions are saved locally first and synced to the server on demand.

- **localStorage `localObj`** – `{ auction: [...], vasuli: [...] }` holds unsynced transactions
- **IndexedDB `mandi` (v3)** – Stores master data fetched from server:
  - `VYAPARI` – buyer/trader records
  - `KISAN` – farmer records
  - `items` – commodity items
  - `allentries` – local auction entries, keyed by `trId` (Unix timestamp ms), deleted after 8 days on startup
- **Sync** – NavBar "Sync" button calls `syncAll()` ([src/gateway/gateway.js](src/gateway/gateway.js)): first POSTs local auction + vasuli arrays to the server, then refreshes all master data into IndexedDB

### App Bootstrap (`App.js`)

1. Opens IndexedDB and calls `setDB()` so all CRUD helpers share the same connection
2. Deletes `allentries` older than 8 days
3. Checks `localStorage.deviceId` after login — if missing, shows `RegisterDevice` dialog
4. Passes `loading` state via React Router `Outlet` context to all child routes

### Authentication

Two levels of password protection:
- **Main app** – PIN checked against `REACT_APP_PASS` env var in `App.js`
- **Vasuli Transaction** – hardcoded PIN `"1212"` gates the vasuli form

Device registration requires a `deviceId` stored in `localStorage`, which is sent as a request header on every API call.

### Routes (`src/index.js`)

| Path | Component | Purpose |
|------|-----------|---------|
| `/` or `/auction-transaction` | `AuctionTransaction` | Primary feature – record produce auctions |
| `/all-entries` | `AllEntries` | View/search auction entries (local or synced) |
| `/item-master` | `ItemMaster` | Manage item catalogue |
| `/party-master` | `PartyMaster` | Manage VYAPARI/KISAN parties |
| `/vasuli-transaction` | `VasuliTransaction` | Record payment collections from traders |
| `/pending-vasuli` | `PendingVasuli` | List traders with overdue payments |

### Auction Transaction Feature

Two auction modes toggled by a Switch (locked once rows are added):
- **Standard mode** – per-bag quantity entry; accumulates individual bag weights into `bagWiseQuantity[]`
- **Nag/Chungi mode** – single `nag` (quantity) + `chungi` field; total = `(rate + chungi) × nag`

In-progress auctions are saved to `localStorage.onGoingAuction` (object keyed by hex timestamp auction ID). On load, if any unfinished auctions exist, `OnGoingAuctions` dialog asks the user to resume or start fresh. The browser tab title is set to the selected Kisan's name while filling an auction.

### Gateway Layer (`src/gateway/`)

- `curdDB.js` – All IndexedDB CRUD; depends on `setDB()` being called at startup
- `gateway.js` → `common-apis.js` – Sync orchestration
- Feature API files (`auction-transaction-apis.js`, `vasuli-transaction-apis.js`, etc.) call either `axiosHttp` or write directly to `localStorage`
- `devices.js` – Device registration/status API calls

### Vasuli Transaction Feature

After submitting a vasuli entry the component immediately tries to sync via `vasuliPost()`. On failure, the record is queued to `localStorage.localObj.vasuli` for later sync. Additional post-submit actions are optional toggles:
- **Print** – uses `react-to-print` in browser, `window.electron.ipcRenderer.invoke("print-content")` in Electron
- **WhatsApp** – sends message via server `/vyapari/notify-vasuli`
- **App Notification** – direct AWS Lambda call (not through the main backend)
- **Speak** – Hindi TTS via Web Speech API (`src/utils/announcement.js`), announces the vyapari name, ID, and amount in Hindi; uses "Microsoft Kalpana - Hindi (India)" voice when available

### Shared UI

- `src/shared/ui/master-table/master-table` – reusable table used by AllEntries, VasuliTransaction, PendingVasuli; accepts `columns`, `keyArray`, `tableData`, and optional action callbacks
- `src/shared/ui/elements/Table-Cell.js` – styled `StyledTableCell` MUI component

### PWA

Service worker registered via `src/serviceWorkerRegistration.js` (CRA's Workbox integration). The app is installable and works offline for data entry; syncing requires connectivity.
