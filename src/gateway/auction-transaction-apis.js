// src/api.js
import axios from 'axios';
import config from "../constants/config";


const axiosInstance = axios.create({
    baseURL: config.apiBaseUrl,
});

export const addAuctionTransaction = async (data) => {
    try {
        const response = await axiosInstance.post('/AuctionTransaction', data);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};

