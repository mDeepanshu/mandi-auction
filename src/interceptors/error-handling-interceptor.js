import axios from 'axios';
import config from '../constants/config'; // Replace with your config file

const axiosHttp = axios.create({
    baseURL: config.apiBaseUrl,
});

axiosHttp.interceptors.response.use(
    
    (response) => {
        // Response interceptor logic here
        // Example: Handle successful responses
        console.log("Interceptor no error");

        return response;
    },
    (error) => {
        // Response error handling logic
        // Example: Handle unauthorized errors (401)
        console.log("Interceptor error");

        if (error?.response?.status != 200) {
            // Handle unauthorized case (e.g., redirect to login)
        }
          return Promise.reject('error');
        // return 'error';
    }
);

export default axiosHttp;