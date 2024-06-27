import { useEffect } from "react";

const db = window.indexedDB;

// const createCollection = () => {
//     if (!idb) {
//         console.log("Need indexedDB to run");
//     }
// }

// const indexedDB = () => {

//     useEffect(() => {
//         createCollection();
//     }, []);
// }

const addItem = (item,collectionName) => {
    const transaction = db.transaction([collectionName], "readwrite");
    const store = transaction.objectStore(collectionName);
    const request = store.add(item);

    request.onsuccess = () => {
        console.log("Item added:", item);
    };

    request.onerror = (event) => {
        console.error("Add item error:", event.target.errorCode);
    };
};

const deleteItem = (id,collectionName) => {
    const transaction = db.transaction([collectionName], "readwrite");
    const store = transaction.objectStore(collectionName);
    const request = store.delete(id);

    request.onsuccess = () => {
        console.log("Item deleted:", id);
    };

    request.onerror = (event) => {
        console.error("Delete item error:", event.target.errorCode);
    };
};

export default indexedDB;