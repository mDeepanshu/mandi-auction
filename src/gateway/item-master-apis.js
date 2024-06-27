import axios from 'axios';
import config from "../constants/config";


const axiosInstance = axios.create({
    baseURL: config.apiBaseUrl,
});

export const addItemGlobal = async (data) => {
    try {
        const response = await axiosInstance.post('/', data);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};