import { addItem } from "./curdDB";
import axiosHttp from "../interceptors/error-handling-interceptor";

export const syncAll = async () => {

    const dataToSync = JSON.parse(localStorage.getItem('localObj'));
    for (const key in dataToSync) {
        if (dataToSync.hasOwnProperty(key)) {
            console.log(key, dataToSync[key]);
            if (dataToSync[key].length) {
                syncTransactions(key, dataToSync[key]);
            }
        }
    }
    const localObj = {
        auction: [],
        vasuli: []
    }
    localStorage.setItem("localObj", JSON.stringify(localObj));

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

    Promise.all([p1, p2, p3]).then(() => console.log("Done all three")).catch(err => {
        console.log("Promise All Error");
    });


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
        const response = await axiosHttp.get(`/party/listAllParties?partyType=${api}temp`);
        console.log(response.data.responseBody);
        addItem(response.data.responseBody, api);
    } catch (error) {
        console.error('Error posting data:', error);
        return 'error';
        // throw error;

    }
}