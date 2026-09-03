import axiosHttp from "../interceptors/error-handling-interceptor";

// Posts exactly one auction. The all-entries page calls this per row; the
// caller flips the record's syncStatus to SYNCED, which is what keeps it out of
// the next bulk sync and disables its button.
export const syncOneAuction = async (auction) => {
    try {
        await axiosHttp.post("auction", [auction]);
        return "SYNCED";
    } catch (error) {
        console.error("Auction sync failed:", error);
        return "FAILED";
    }
};
