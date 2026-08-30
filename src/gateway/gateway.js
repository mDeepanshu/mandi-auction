import { syncTransactions, syncItems, syncParties } from "./common-apis";
import { syncCrateIssues } from "./crate-apis";
import { setEntrySyncStatus } from "./curdDB";

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
// records it sent so only those get dropped from the queue. trId is a local
// marker tying the queued record to its IndexedDB row — it is not sent.
const runTransactionSync = async (label, api, records) => {
  const batch = records || [];
  if (batch.length === 0) return 0;
  const payload = batch.map(({ trId, ...rest }) => rest);
  await runSync(label, () => syncTransactions(api, payload));
  return batch.length;
};

// Keeps the all-entries page honest after a bulk sync: every auction this run
// actually posted is marked SYNCED, so its per-row button stays disabled and
// cannot send the same auction a second time.
const markAuctionsSynced = async (auctions) => {
  await Promise.all(
    (auctions || [])
      .filter((auction) => auction.trId)
      .map((auction) =>
        setEntrySyncStatus(auction.trId, "SYNCED").catch((error) =>
          console.error("Failed to mark auction synced:", auction.trId, error)
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
    const [auctionCount, vasuliCount] = await Promise.all([
      runTransactionSync("Auction", "auction", dataToSync.auction),
      runTransactionSync("Vasuli Transaction", "party/vasuliTrasaction?confirmDuplicate=true", dataToSync.vasuli),
    ]);

    dropSyncedRecords("auction", auctionCount);
    dropSyncedRecords("vasuli", vasuliCount);
    await markAuctionsSynced((dataToSync.auction || []).slice(0, auctionCount));

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
