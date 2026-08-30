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
      const putRequest = store.put(record);
      putRequest.onsuccess = () => resolve(record);
      putRequest.onerror = (err) => reject(err.target.error);
    };

    getRequest.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

// Every auction still awaiting the server, oldest first so a bulk sync posts
// them in the order they were entered. This store is the only queue for
// auctions, so an already-SYNCED record can never be picked up again.
const getUnsyncedAuctions = () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["allentries"], "readonly");
    const store = transaction.objectStore("allentries");
    const request = store.getAll();

    request.onsuccess = (event) => {
      const records = event.target.result || [];
      resolve(
        records
          .filter((record) => record.auctionData && record.syncStatus !== "SYNCED")
          .sort((a, b) => a.trId - b.trId)
      );
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
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
  getUnsyncedAuctions,
};
