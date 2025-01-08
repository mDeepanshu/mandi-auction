import { syncTransactions, syncItems, syncParties } from "./common-apis";

export const syncAll = async () => {

    const dataToSync = JSON.parse(localStorage.getItem('localObj'));

    let p1 = new Promise((res, rej) => syncItems().then((data) => {
        if (data !== "error") {
            res();
        } else {
            rej("Item Sync Failed");
        }
    }));
    let p2 = new Promise((res, rej) => syncParties("VYAPARI").then((data) => {
        if (data !== "error") {
            res();
        } else {
            rej("Vyapari Sync Failed");
        }
    }));
    let p3 = new Promise((res, rej) => syncParties("KISAN").then((data) => {
        if (data !== "error") {
            res();
        } else {
            rej("Kisan Sync Failed");
        }
    }));
    let p4 = new Promise((res, rej) => syncTransactions("auction", dataToSync.auction).then((data) => {
        if (data !== "error") {
            res();
        } else {
            rej("Auction Sync Failed");
        }
    }));
    let p5 = new Promise((res, rej) => syncTransactions("party/vasuliTrasaction", dataToSync.vasuli).then((data) => {
        if (data !== "error") {
            res();
        } else {
            rej("Vasuli Trasaction Sync Failed");
        }
    }));

    p4.then((data) => {
        let prevLocalObj = JSON.parse(localStorage.getItem('localObj'));
        prevLocalObj.auction = [];
        localStorage.setItem('localObj', JSON.stringify(prevLocalObj));
    }).catch((err) => {
        console.log(err);
    });

    p5.then((data) => {
        let prevLocalObj = JSON.parse(localStorage.getItem('localObj'));
        prevLocalObj.vasuli = [];
        localStorage.setItem('localObj', JSON.stringify(prevLocalObj));
    }).catch((err) => {
        console.log(err);
    });

    return Promise.all([p1, p2, p3, p4, p5])
        .then(() => {
            const localObj = {
                auction: [],
                vasuli: []
            }
            localStorage.setItem("localObj", JSON.stringify(localObj));
            return `done`;
        })
        .catch((err) => {
            console.log(err);
            return err;
        });

};


