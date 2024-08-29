import { syncTransactions, syncItems, syncParties } from "./common-apis";

export const syncAll = async () => {

    const dataToSync = JSON.parse(localStorage.getItem('localObj'));

    let p1 = new Promise((res, rej) => syncItems().then((data) => {
        if (data !== "error") {
            res();
        } else {
            rej("errorp1");
        }
    }));
    let p2 = new Promise((res, rej) => syncParties("VYAPARI").then((data) => {
        if (data !== "error") {
            res();
        } else {
            rej("errorp2");
        }
    }));
    let p3 = new Promise((res, rej) => syncParties("KISAN").then((data) => {
        if (data !== "error") {
            res();
        } else {
            rej("errorp3");
        }
    }));
    let p4 = new Promise((res, rej) => syncTransactions("auction", dataToSync.auction).then((data) => {
        if (data) {
            res();
        } else {
            rej("errorp4");
        }
    }));
    let p5 = new Promise((res, rej) => syncTransactions("party/vasuliTrasaction", dataToSync.vasuli).then((data) => {
        if (data !== "error") {
            res();
        } else {
            rej("errorp5");
        }
    }));

    // let promise = new Promise((resolve,rej) => {
    //     setTimeout(() => {
    //         resolve('Resolved after 5 seconds');
    //     }, 2000);
    //   });



    // return Promise.all([promise])
    return Promise.all([p1, p2, p3, p4, p5])
        .then(() => {
            const localObj = {
                auction: [],
                vasuli: []
            }
            localStorage.setItem("localObj", JSON.stringify(localObj));
            return true;
        })
        .catch((err) => {
            return false;
        });

};


