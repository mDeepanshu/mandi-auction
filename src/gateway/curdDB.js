// indexedDBCRUD.js

let db='mandi';

const setDB = (database) => {
  db = database;
};

const addItem = (data,collectionName) => {
  const transaction = db.transaction([collectionName], "readwrite");
  const store = transaction.objectStore(collectionName);
  store.clear();
  
  data.forEach(item => {
    const request = store.add(item);

    request.onsuccess = () => {
      // resolve(item);
    };

    request.onerror = (event) => {
      // reject(event.target.errorCode);
    };
  });

  transaction.oncomplete = () => {
    console.log('All items added successfully');
  };

  transaction.onerror = (event) => {
    console.error('Transaction error:', event.target.errorCode);
  };
};

const addNewEntry = (NewEntryObj) => {
  const transaction = db.transaction(["allentries"], "readwrite");
  const store = transaction.objectStore("allentries");
  const request = store.add(NewEntryObj);

  request.onsuccess = () => {
    console.log(`item added success`);
    
    // resolve(item);
  };

  request.onerror = (event) => {
    console.log(`item added error`);
    // reject(event.target.errorCode);
  };
};

const getAuctionEntries = (start,end) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["allentries"], "readonly");
    const store = transaction.objectStore("allentries");

    let keyRange = IDBKeyRange.bound(start,end, false, false);

    let results = [];
    let cursorRequest = store.openCursor(keyRange);

    cursorRequest.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            results.push(cursor.value); // Add the entry to results
            cursor.continue(); // Move to the next entry
        } else {
            console.log("Entries in range:", results);
            resolve(results);
        }
    };

    cursorRequest.onerror = function (event) {
        console.error("Error fetching data:", event.target.error);
    };
  });
};

const getItem = (id,collectionName) => {
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

const updateItem = (item,collectionName) => {
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

const deleteItem = (id,collectionName) => {
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

export { setDB, addItem, getItem, getAllItems, updateItem, deleteItem, addNewEntry, getAuctionEntries };
