import { addItem } from "./curdDB";
import axiosHttp from "../interceptors/error-handling-interceptor";

export const syncAll = async () => {

    const dataToSync = JSON.parse(localStorage.getItem('localObj'));

    let p1 = new Promise((res, rej) => syncItems().then((data) => {
        if (data) {
            res();
        }
    }));
    let p2 = new Promise((res, rej) => syncParties("VYAPARI").then((data) => {
        if (data) {
            res();
        }
    }));
    let p3 = new Promise((res, rej) => syncParties("KISAN").then((data) => {
        if (data) {
            res();
        }
    }));
    let p4 = new Promise((res, rej) => syncTransactions("auction", dataToSync.auction).then((data) => {
        if (data) {
            res();
        } else {
            rej("errorp4");
        }
    }));
    let p5 = new Promise((res, rej) => syncTransactions("vasuli", dataToSync.vasuli).then((data) => {
        if (data != "error") {
            console.log(data);
            res();
        } else {
            rej("errorp5");
        }
    }));

    Promise.all([p1, p2, p3, p4, p5])
        .then((data) => {
            console.log("Done all Five", data)
            return "syncDone";
        })
        .catch((err) => {
            console.log("Sync Failed. Try Again.");
        });

    const localObj = {
        auction: [],
        vasuli: []
    }
    localStorage.setItem("localObj", JSON.stringify(localObj));

};

export const syncTransactions = async (api, data) => {
    try {
        const response = await axiosHttp.post(api, data);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        return 'error';
        // throw error;
    }
};

export const syncItems = async () => {
    try {
        const response = await axiosHttp.get('/listItems');
        console.log(response.data.responseBody);
        addItem(response.data.responseBody, "items");
    } catch (error) {
        console.error('Error posting data:', error);
        return 'error';
        // throw error;

    }
};

export const syncParties = async (api) => {
    try {
        const response = await axiosHttp.get(`/party/listAllParties?partyType=${api}`);
        console.log(response.data.responseBody);
        addItem(response.data.responseBody, api);
    } catch (error) {
        console.error('Error posting data:', error);
        return 'error';
        // throw error;

    }
}

// for (const key in dataToSync) {
//     if (dataToSync.hasOwnProperty(key)) {
//         console.log(key, dataToSync[key]);
//         if (dataToSync[key].length) {
//             syncTransactions(key, dataToSync[key]);
//         }
//     }
// }