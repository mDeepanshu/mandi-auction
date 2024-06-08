// src/api.js
import axios from 'axios';
import config from "../constants/config";


const axiosInstance = axios.create({
    baseURL: config.apiBaseUrl,
});


export const getKisan = async (data) => {
    try {
        const response = await axiosInstance.get('/getPartyData', data);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};

export const getVyapari = async (data) => {
    try {
        const response = await axiosInstance.get('/getPartyData', data);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};

export const getItems = async (data) => {
    try {
        const response = await axiosInstance.get('/getItemsData', data);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};