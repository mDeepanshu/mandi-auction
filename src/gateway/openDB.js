// indexedDBSetup.js

const dbName = "mandi";
const dbVersion = 3;
let db;

const openDB = () => {
  return new Promise((resolve, reject) => {

    // Auctions are no longer queued here — they live in the `allentries` store,
    // which carries its own syncStatus.
    const localObj = {
      vasuli:[],
      crateIssue:[]
    }

    if (!localStorage.getItem("localObj")) {
      localStorage.setItem("localObj",JSON.stringify(localObj));
    } else {
      // Retire the old auction queue on first load after the upgrade. It cannot
      // be replayed automatically: those auctions carry no sync status, so
      // re-posting them is exactly the duplication this change removes. Anything
      // left in it is set aside under `localObjAuctionBackup` rather than
      // deleted, so a genuinely unsynced auction can still be recovered by hand.
      const existing = JSON.parse(localStorage.getItem("localObj") || "{}");
      if (existing.auction) {
        if (existing.auction.length && !localStorage.getItem("localObjAuctionBackup")) {
          localStorage.setItem("localObjAuctionBackup", JSON.stringify(existing.auction));
          console.warn(
            `Retired ${existing.auction.length} queued auction(s) to localObjAuctionBackup; verify them on the server.`
          );
        }
        delete existing.auction;
        localStorage.setItem("localObj", JSON.stringify(existing));
      }
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
      if (!db.objectStoreNames.contains("allentries")) {
        db.createObjectStore("allentries", { keyPath: "trId"});
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
