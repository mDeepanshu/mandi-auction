import { useEffect } from "react";


const idb = window.indexedDB;
const createCollection = () => {
    if (!idb) {
        console.log("Need indexedDB to run");
    }
    const mandiDB = idb.open("mandiDB");
    mandiDB.onerror = (event) => {
        console.log("error in indexedDB", event);
    }

    mandiDB.onupgradeneeded = (event) => {
        const db = mandiDB.result;

        if (!db.objectStoreNames.contains('kisanList')) {
            db.createObjectStore("kisanList", {
                keyPath: "id"
            })
        }

        if (!db.objectStoreNames.contains('vyapariList')) {
            db.createObjectStore("vyapariList", {
                keyPath: "id"
            })
        }

        if (!db.objectStoreNames.contains('itemList')) {
            db.createObjectStore("itemList", {
                keyPath: "id"
            })
        }
    }

    mandiDB.onsuccess = () => {
        console.log("Database opened succesfully");
    }
}

function IndexedDBOpen() {
    createCollection();
}

export default IndexedDBOpen;