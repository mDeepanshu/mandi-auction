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
        if (error?.response?.status == `E001` || error?.response?.status == `E002`){
          Promise.reject(error?.response?.message);
        }

        if (error?.response?.status != 200) {
            // Handle unauthorized case (e.g., redirect to login)
        }
        return Promise.reject('error');
        // return 'error';
    }
);

axiosHttp.interceptors.request.use(
    (config) => {
        // Modify the request config before it is sent
        const deviceId = localStorage.getItem('deviceId'); // Retrieve the deviceId from local storage
        if (deviceId) {
          config.headers.deviceId = deviceId;
        }
        console.log(deviceId);
        
        return config;
      },
      (error) => {
        // Handle request error
        return Promise.reject(error);
      }
)

export default axiosHttp;