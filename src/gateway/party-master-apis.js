// import axios from 'axios';
// import config from "../constants/config";
import  axiosHttp  from "../interceptors/error-handling-interceptor";


// const axiosInstance = axios.create({
//     baseURL: config.apiBaseUrl,
// });

export const addParty = async (data) => {
    try {
        const response = await axiosHttp.post('/party', data);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};