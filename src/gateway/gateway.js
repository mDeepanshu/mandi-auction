import { syncTransactions, syncItems, syncParties } from "./common-apis";
import { syncCrateIssues } from "./crate-apis";
import { claimUnsyncedAuctions, releaseAuctionClaims, setEntrySyncStatus } from "./curdDB";

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

// Auctions live in IndexedDB, keyed on trId. Records are CLAIMED (marked
// SYNCING in one atomic transaction) before the POST, not after it: operators
// work with several tabs open, and a tab-local guard cannot stop a second tab
// from reading the same pending list mid-request and posting it again.
const syncPendingAuctions = async () => {
  const claimed = await claimUnsyncedAuctions();
  if (claimed.length === 0) return;

  try {
    await runSync("Auction", () => syncTransactions("auction", claimed.map((record) => record.auctionData)));
  } catch (error) {
    // Nothing reached the server — hand the claims back so the next sync retries.
    await releaseAuctionClaims(claimed.map((record) => record.trId));
    announceAuctionChange();
    throw error;
  }

  await Promise.all(
    claimed.map((record) =>
      setEntrySyncStatus(record.trId, "SYNCED").catch((error) =>
        console.error("Failed to mark auction synced:", record.trId, error)
      )
    )
  );
  announceAuctionChange();
};

// Tells every open tab that auction rows changed, so a page showing them can
// re-read IndexedDB. Without this the all-entries table keeps rendering the
// state it loaded on mount and rows sit at PENDING long after they synced.
export const AUCTION_SYNC_CHANNEL = "mandi-auction-sync";

const announceAuctionChange = () => {
  try {
    const channel = new BroadcastChannel(AUCTION_SYNC_CHANNEL);
    channel.postMessage({ type: "auctions-updated", at: Date.now() });
    channel.close();
  } catch (error) {
    // BroadcastChannel is unavailable — same-tab refresh still works.
    console.warn("Could not broadcast auction sync:", error);
  }
};

// Web Locks serialise the whole sync across tabs, so a second tab waits rather
// than racing. The claim above is what actually guarantees correctness; this
// avoids the wasted round-trip, and is skipped where the API is unavailable.
const withSyncLock = async (fn) => {
  if (!navigator.locks?.request) return fn();
  return navigator.locks.request("mandi-sync-all", fn);
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
  inFlightSync = withSyncLock(runSyncAll).finally(() => {
    inFlightSync = null;
  });
  return inFlightSync;
};
