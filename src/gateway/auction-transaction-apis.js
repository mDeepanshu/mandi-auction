// src/api.js
import axios from 'axios';
import config from "../constants/config";

const axiosInstance = axios.create({
    baseURL: config.apiBaseUrl,
});

export const addAuctionTransaction = async (data) => {
    // try {
    //     const response = await axiosInstance.post('/auction', data);
    //     return response.data;
    // } catch (error) {
    //     console.error('Error posting data:', error);
    //     throw error;
    // }

    let recordsArray  = JSON.parse(localStorage.getItem('localObj'));
    recordsArray.auction.push(data)
    // console.log("data",recordsArray.auction.push(data));
    console.log(recordsArray);
    localStorage.setItem('localObj',JSON.stringify(recordsArray));
    

};

