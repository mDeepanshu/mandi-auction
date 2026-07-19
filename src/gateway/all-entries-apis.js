import axiosHttp from "../interceptors/error-handling-interceptor";

export const getAuctionEntriesList = async (startDate,endDate) => {
  try {
    const response = await axiosHttp.get(`/auction/list-auction-transaction?startDate=${startDate}&endDate=${endDate}&deviceId=${localStorage.getItem(`deviceId`)}`);
    return normalizeAuctionEntriesList(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Old backend returned responseBody as a flat array of transactions.
// New backend returns { auctionTransactions, itemTotals }. Flatten both to the
// old shape and expose itemTotals separately so callers stay unchanged.
const normalizeAuctionEntriesList = (data) => {
  if (!data) return data;
  const body = data.responseBody;
  if (Array.isArray(body)) return { ...data, responseBody: body, itemTotals: [] };
  return {
    ...data,
    responseBody: body?.auctionTransactions ?? [],
    itemTotals: body?.itemTotals ?? [],
  };
};