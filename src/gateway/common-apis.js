import { addItem } from "./curdDB";
import axiosHttp from "../interceptors/error-handling-interceptor";

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
        addItem(response.data.responseBody, "items");
    } catch (error) {
        console.error('Error posting data:', error);
        return 'error';
        // throw error;

    }
};

export const syncParties = async (partyType) => {
    try {
        const response = await axiosHttp.get(`/party/listAllParties?partyType=${partyType}`);
        addItem(response.data.responseBody, partyType);
    } catch (error) {
        console.error('Error posting data:', error);
        return 'error';
    }
}