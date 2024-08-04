// indexedDBSetup.js

const dbName = "mandi";
const dbVersion = 1;
let db;

const openDB = () => {
  return new Promise((resolve, reject) => {

    const localObj = {
      auction:[],
      vasuli:[]
    }

    if (!localStorage.getItem("localObj")) {
      localStorage.setItem("localObj",JSON.stringify(localObj));
    }

    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains("VYAPARI")) {
        db.createObjectStore("VYAPARI", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("KISAN")) {
        db.createObjectStore("KISAN", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("items")) {
        db.createObjectStore("items", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject(event.target.errorCode);
    };
  });
};

export default openDB ;
