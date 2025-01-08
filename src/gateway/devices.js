import axiosHttp from "../interceptors/error-handling-interceptor";

export const getDevices = async () => {
    try {
        const response = await axiosHttp.get('/device/listDevices?status=REJECTED&status=DELETED');
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        return 'error';
        // throw error;

    }
};

export const updateStatus = async (deviceId) => {
    try {
        const response = await axiosHttp.put(`device/${deviceId}/status?status=REQUESTED`);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        return 'error';
        // throw error;

    }
};

export const addDevice = async (deviceData) => {
    try {
        const response = await axiosHttp.post('/device/register',deviceData);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        return 'error';
        // throw error;

    }
};

export const getStatus = async (status) => {
    try {
        const response = await axiosHttp.get('/device/listDevices?status=REJECTED&status=DELETED');
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        return 'error';
        // throw error;

    }
};