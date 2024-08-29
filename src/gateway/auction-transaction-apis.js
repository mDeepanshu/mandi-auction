
export const addAuctionTransaction = async (data) => {
    let recordsArray  = JSON.parse(localStorage.getItem('localObj'));
    recordsArray.auction.push(data)
    localStorage.setItem('localObj',JSON.stringify(recordsArray));
};

