import axiosHttp from "../interceptors/error-handling-interceptor";

export const addAuctionTransaction = async (data) => {
    let recordsArray  = JSON.parse(localStorage.getItem('localObj'));
    recordsArray.auction.push(data)
    localStorage.setItem('localObj',JSON.stringify(recordsArray));
};

// Once an auction is sent from the all-entries page it must leave the bulk
// queue, otherwise the navbar Sync would post it a second time.
const removeFromAuctionQueue = (trId) => {
    if (!trId) return;
    const localObj = JSON.parse(localStorage.getItem("localObj") || "{}");
    localObj.auction = (localObj.auction || []).filter((auction) => auction.trId !== trId);
    localStorage.setItem("localObj", JSON.stringify(localObj));
};

// Posts exactly one auction. The all-entries page calls this per row so a
// retry can never re-send an auction that already went through.
export const syncOneAuction = async (auction, trId) => {
    try {
        await axiosHttp.post("auction", [auction]);
        removeFromAuctionQueue(trId);
        return "SYNCED";
    } catch (error) {
        console.error("Auction sync failed:", error);
        return "FAILED";
    }
};
