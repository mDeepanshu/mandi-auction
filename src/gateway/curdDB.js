// indexedDBCRUD.js

let db='mandi';

const setDB = (database) => {
  db = database;
};

const addItem = (item,collectionName) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([collectionName], "readwrite");
    const store = transaction.objectStore(collectionName);
    const request = store.add(item);

    request.onsuccess = () => {
      resolve(item);
    };

    request.onerror = (event) => {
      reject(event.target.errorCode);
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

export { setDB, addItem, getItem, getAllItems, updateItem, deleteItem };
