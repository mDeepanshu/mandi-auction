import { syncTransactions, syncItems, syncParties } from "./common-apis";
import { syncCrateIssues } from "./crate-apis";
import { getUnsyncedAuctions, setEntrySyncStatus } from "./curdDB";

// Drops only the records that were actually sent. Clearing the whole array
// instead would re-send anything queued while the request was in flight, or
// silently discard it.
const dropSyncedRecords = (field, syncedCount) => {
  const localObj = JSON.parse(localStorage.getItem("localObj") || "{}");
  localObj[field] = (localObj[field] || []).slice(syncedCount);
  localStorage.setItem("localObj", JSON.stringify(localObj));
};

const runSync = async (label, promiseFn) => {
  const result = await promiseFn();
  if (result === "error") {
    throw new Error(`${label} Sync Failed`);
  }
};

// Posts a batch only when there is something to post, and reports back how many
// records it sent so only those get dropped from the queue.
const runTransactionSync = async (label, api, records) => {
  const batch = records || [];
  if (batch.length === 0) return 0;
  await runSync(label, () => syncTransactions(api, batch));
  return batch.length;
};

// Auctions live in IndexedDB, keyed on trId, and are marked SYNCED once posted.
// Reading the queue from there means a record that already went through is
// never picked up again, so a repeat sync cannot duplicate it.
const syncPendingAuctions = async () => {
  const pending = await getUnsyncedAuctions();
  if (pending.length === 0) return;

  await runSync("Auction", () => syncTransactions("auction", pending.map((record) => record.auctionData)));

  await Promise.all(
    pending.map((record) =>
      setEntrySyncStatus(record.trId, "SYNCED").catch((error) =>
        console.error("Failed to mark auction synced:", record.trId, error)
      )
    )
  );
};

// Tapping Sync twice used to POST the same queue twice, because the queue was
// only cleared after both requests came back. One sync at a time now; a second
// tap while one is running joins the run in progress instead of starting a new one.
let inFlightSync = null;

const runSyncAll = async () => {
  const dataToSync = JSON.parse(localStorage.getItem("localObj") || "{}");

  // fire and forget — crate sync must not affect the sync status
  syncCrateIssues();

  try {
    const [, vasuliCount] = await Promise.all([
      syncPendingAuctions(),
      runTransactionSync("Vasuli Transaction", "party/vasuliTrasaction?confirmDuplicate=true", dataToSync.vasuli),
    ]);

    dropSyncedRecords("vasuli", vasuliCount);

    await Promise.all([
      runSync("Item", syncItems),
      runSync("Vyapari", () => syncParties("VYAPARI")),
      runSync("Kisan", () => syncParties("KISAN")),
    ]);

    return "done";
  } catch (error) {
    console.error(error);
    return error.message || "Sync failed";
  }
};

export const syncAll = async () => {
  if (inFlightSync) return inFlightSync;
  inFlightSync = runSyncAll().finally(() => {
    inFlightSync = null;
  });
  return inFlightSync;
};
