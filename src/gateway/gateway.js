import { syncTransactions, syncItems, syncParties } from "./common-apis";

const clearLocalStorageFields = (fields) => {
  const localObj = JSON.parse(localStorage.getItem("localObj") || "{}");
  for (const field of fields) {
    localObj[field] = [];
  }
  localStorage.setItem("localObj", JSON.stringify(localObj));
};

const runSync = async (label, promiseFn) => {
  const result = await promiseFn();
  if (result === "error") {
    throw new Error(`${label} Sync Failed`);
  }
};

export const syncAll = async () => {
  const dataToSync = JSON.parse(localStorage.getItem("localObj") || "{}");

  try {
    await Promise.all([
      runSync("Auction", () => syncTransactions("auction", dataToSync.auction)),
      runSync("Vasuli Transaction", () =>
        syncTransactions("party/vasuliTrasaction", dataToSync.vasuli)
      ),
    ]);

    clearLocalStorageFields(["auction", "vasuli"]);

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
