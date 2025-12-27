import axiosHttp from "../interceptors/error-handling-interceptor";

export const addItemGlobal = async (data) => {
    try {
        const response = await axiosHttp.post('/items', data);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
    }
};

export const getItem = async () => {
    try {
        const response = await axiosHttp.get('/items/listItems');
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
    }
};