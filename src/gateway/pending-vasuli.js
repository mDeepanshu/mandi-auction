import axiosHttp from "../interceptors/error-handling-interceptor";

export const getPendingVasuliList = async (showToday) => {
  try {
    const response = await axiosHttp.get(`/vyapari/pending-vasuli?showToday=${showToday}`);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

export const editVasuli = async (vasuli) => {
  try {
    const response = await axiosHttp.put(`/vyapari/edit-vasuli`,vasuli);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};