import axiosHttp from "../interceptors/error-handling-interceptor";

export const addVasuliTransaction = async (data) => {
    let recordsArray  = JSON.parse(localStorage.getItem('localObj'));
    recordsArray.vasuli.push(data)
    localStorage.setItem('localObj',JSON.stringify(recordsArray));
};

export const getOwedAmount = async (partyId) => {
    try {
        const response = await axiosHttp.get(`/party/getPartyById?partyId=${partyId}`);
        return response;
    } catch (error) {
        console.error('Error posting data:', error);
        return 'error';
    }
}