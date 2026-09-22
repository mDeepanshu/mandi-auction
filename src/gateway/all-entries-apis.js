import axiosHttp from "../interceptors/error-handling-interceptor";

// Old backend: responseBody is the transaction array itself.
// New backend: responseBody is { itemTotals: [...], auctionTransactions: [...] }.
// Normalize both into { auctionTransactions, itemTotals }.
export const normalizeAuctionEntries = (responseBody) => {
  if (Array.isArray(responseBody)) return { auctionTransactions: responseBody, itemTotals: [] };
  return {
    auctionTransactions: responseBody?.auctionTransactions ?? [],
    itemTotals: responseBody?.itemTotals ?? [],
  };
};

export const getAuctionEntriesList = async (startDate, endDate) => {
  try {
    const response = await axiosHttp.get(
      `/auction/list-auction-transaction?startDate=${startDate}&endDate=${endDate}&deviceId=${localStorage.getItem(`deviceId`)}`
    );
    const data = response.data;
    return { ...data, responseBody: normalizeAuctionEntries(data?.responseBody) };
  } catch (error) {
    console.error('Error:', error);
  }
};
