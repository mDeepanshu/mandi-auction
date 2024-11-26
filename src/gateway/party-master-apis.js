import axiosHttp from "../interceptors/error-handling-interceptor";

export const addPartyGlobal = async (data) => {
    try {
        const response = await axiosHttp.post('/party', data);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        console.error('Not Throwing Error');

    }
};

export const getPartyGlobal = async () => {
    try {
        const response = await axiosHttp.get('party/listAllParties');
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        console.error('Not Throwing Error');

    }
};