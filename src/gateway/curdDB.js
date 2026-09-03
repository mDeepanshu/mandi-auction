// indexedDBCRUD.js

let db = "mandi";

const setDB = (database) => {
  db = database;
};

const addItem = (data, collectionName) => {
  const transaction = db.transaction([collectionName], "readwrite");
  const store = transaction.objectStore(collectionName);
  store.clear();

  data.forEach((item) => {
    const request = store.add(item);

    request.onsuccess = () => {
      // resolve(item);
    };

    request.onerror = (event) => {
      // reject(event.target.errorCode);
    };
  });

  transaction.oncomplete = () => {
    console.log("All items added successfully");
  };

  transaction.onerror = (event) => {
    console.error("Transaction error:", event.target.errorCode);
  };
};

const addNewEntry = (NewEntryObj) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["allentries"], "readwrite");
    const store = transaction.objectStore("allentries");
    const request = store.add(NewEntryObj);

    request.onsuccess = () => {
      resolve(NewEntryObj);
    };

    request.onerror = (event) => {
      console.log(`item added error`);
      reject(event.target.error);
    };
  });
};

// Flips one auction's sync status in place. The record is keyed on trId, so a
// second sync of the same auction overwrites the same row instead of adding one.
const setEntrySyncStatus = (trId, syncStatus) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["allentries"], "readwrite");
    const store = transaction.objectStore("allentries");
    const getRequest = store.get(trId);

    getRequest.onsuccess = (event) => {
      const record = event.target.result;
      if (!record) {
        resolve(null);
        return;
      }
      record.syncStatus = syncStatus;
      // The claim is over once the record reaches a terminal status; leaving the
      // timestamp behind would confuse the staleness check on a later retry.
      delete record.claimedAt;
      const putRequest = store.put(record);
      putRequest.onsuccess = () => resolve(record);
      putRequest.onerror = (err) => reject(err.target.error);
    };

    getRequest.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

// A claim older than this is treated as abandoned — the tab that made it was
// closed or crashed mid-sync. Long enough to outlast a slow POST on a bad
// connection, short enough that a stranded auction recovers on the next sync.
const CLAIM_TIMEOUT_MS = 120000;

const isClaimable = (record, now) => {
  if (!record.auctionData || record.syncStatus === "SYNCED") return false;
  if (record.syncStatus !== "SYNCING") return true;
  // Reclaim a stale SYNCING record left behind by a tab that went away.
  return !record.claimedAt || now - record.claimedAt > CLAIM_TIMEOUT_MS;
};

// Claims every auction still awaiting the server and returns what it claimed,
// oldest first. Read and claim happen inside ONE readwrite transaction: two
// tabs sharing this IndexedDB are serialised by the transaction, so the second
// sees the first's SYNCING marks and claims nothing. Without this, both tabs
// read the same pending list and POST it — duplicating every auction.
const claimUnsyncedAuctions = () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["allentries"], "readwrite");
    const store = transaction.objectStore("allentries");
    const request = store.getAll();
    const now = Date.now();
    let claimed = [];

    request.onsuccess = (event) => {
      claimed = (event.target.result || []).filter((record) => isClaimable(record, now)).sort((a, b) => a.trId - b.trId);
      claimed.forEach((record) => {
        record.syncStatus = "SYNCING";
        record.claimedAt = now;
        store.put(record);
      });
    };

    request.onerror = (event) => reject(event.target.error);
    transaction.oncomplete = () => resolve(claimed);
    transaction.onerror = (event) => reject(event.target.error);
    transaction.onabort = (event) => reject(event.target.error);
  });
};

// Same claim, for a single auction — the all-entries row button. Resolves null
// when another tab already holds it, so the caller knows not to post.
const claimAuction = (trId) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["allentries"], "readwrite");
    const store = transaction.objectStore("allentries");
    const getRequest = store.get(trId);
    const now = Date.now();
    let claimedRecord = null;

    getRequest.onsuccess = (event) => {
      const record = event.target.result;
      if (!record || !isClaimable(record, now)) return;
      record.syncStatus = "SYNCING";
      record.claimedAt = now;
      store.put(record);
      claimedRecord = record;
    };

    getRequest.onerror = (event) => reject(event.target.error);
    transaction.oncomplete = () => resolve(claimedRecord);
    transaction.onerror = (event) => reject(event.target.error);
    transaction.onabort = (event) => reject(event.target.error);
  });
};

// Releases claims that were never posted, so a failed sync retries next time
// instead of sitting SYNCING until the claim goes stale.
const releaseAuctionClaims = async (trIds) => {
  await Promise.all(
    (trIds || []).map((trId) =>
      setEntrySyncStatus(trId, "FAILED").catch((error) => console.error("Failed to release claim:", trId, error))
    )
  );
};

const getAuctionEntries = (start, end) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["allentries"], "readonly");
    const store = transaction.objectStore("allentries");

    let keyRange = IDBKeyRange.bound(start, end, false, false);

    let results = [];
    let cursorRequest = store.openCursor(keyRange);

    cursorRequest.onsuccess = function (event) {
      let cursor = event.target.result;
      if (cursor) {
        results.push(cursor.value); // Add the entry to results
        cursor.continue(); // Move to the next entry
      } else {
        resolve(results);
      }
    };

    cursorRequest.onerror = function (event) {
      console.error("Error fetching data:", event.target.error);
    };
  });
};

const deleteOldAuctionEntries = (maxValue) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["allentries"], "readwrite");
    const store = transaction.objectStore("allentries");

    const range = IDBKeyRange.upperBound(maxValue, true);

    const cursorRequest = store.openCursor(range);

    cursorRequest.onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            cursor.delete();  // Delete the current entry
            cursor.continue(); // Move to the next matching entry
        }
    };

    cursorRequest.onerror = function(event) {
        console.error("Error opening cursor:", event.target.error);
        reject(event.target.error);
    };

    transaction.oncomplete = function() {
        resolve(`Deleted`);
    };
  });
};

const getItem = (id, collectionName) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([collectionName], "readonly");
    const store = transaction.objectStore(collectionName);
    const request = store.get(id);

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.errorCode);
    };
  });
};

const getAllItems = (collectionName) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([collectionName], "readonly");
    const store = transaction.objectStore(collectionName);
    const request = store.getAll();

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.errorCode);
    };
  });
};

const updateItem = (item, collectionName) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([collectionName], "readwrite");
    const store = transaction.objectStore(collectionName);
    const request = store.put(item);

    request.onsuccess = () => {
      resolve(item);
    };

    request.onerror = (event) => {
      reject(event.target.errorCode);
    };
  });
};

const deleteItem = (id, collectionName) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([collectionName], "readwrite");
    const store = transaction.objectStore(collectionName);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve(id);
    };

    request.onerror = (event) => {
      reject(event.target.errorCode);
    };
  });
};

export {
  setDB,
  addItem,
  getItem,
  getAllItems,
  updateItem,
  deleteItem,
  addNewEntry,
  getAuctionEntries,
  deleteOldAuctionEntries,
  setEntrySyncStatus,
  claimUnsyncedAuctions,
  claimAuction,
  releaseAuctionClaims,
};
