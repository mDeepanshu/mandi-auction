import axiosHttp from "../interceptors/error-handling-interceptor";

export const addItemGlobal = async (data) => {
    try {
        const response = await axiosHttp.post('/', data);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
    }
};

export const getItem = async () => {
    try {
        const response = await axiosHttp.get('/listItems');
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
    }
};