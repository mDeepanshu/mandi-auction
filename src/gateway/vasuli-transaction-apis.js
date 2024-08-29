export const addVasuliTransaction = async (data) => {
    let recordsArray  = JSON.parse(localStorage.getItem('localObj'));
    recordsArray.vasuli.push(data)
    localStorage.setItem('localObj',JSON.stringify(recordsArray));
};