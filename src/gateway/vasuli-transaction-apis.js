import axiosHttp from "../interceptors/error-handling-interceptor";

export const addVasuliTransaction = async (data) => {
  try {
    let recordsArray = JSON.parse(localStorage.getItem("localObj"));
    recordsArray.vasuli.push(data);
    localStorage.setItem("localObj", JSON.stringify(recordsArray));
    return "success";
  } catch (error) {
    console.error("Error posting data:", error);
    return "error";
  }
};

export const getOwedAmount = async (partyId) => {
  try {
    const response = await axiosHttp.get(`/party/getPartyById?partyId=${partyId}`);
    return response;
  } catch (error) {
    console.error("Error posting data:", error);
    return "error";
  }
};
export const whatsAppVasuli = async (vasuli) => {
  try {
    const response = await axiosHttp.post(`/vyapari/notify-vasuli`, vasuli);
    return response;

    // const fakeResponse = await new Promise((resolve) => {
    //   setTimeout(() => {
    //     resolve({data:{
    //       responseCode: "200",
    //       responseMessage: "Success",
    //       responseBody:""
    //       // responseBody:
    //       //   '{"messaging_product":"whatsapp","contacts":[{"input":"8349842228","wa_id":"918349842228"}],"messages":[{"id":"wamid.HBgMOTE4MzQ5ODQyMjI4FQIAERgSNkE3NEFFNzUwNkQxQzg1RkFDAA==","message_status":"accepted"}]}',
    //     }});
    //   }, 1000);
    // });
    // return fakeResponse;
    
  } catch (error) {
    console.error("Error posting data:", error);
    return "error";
  }
};

export const sendNotification = async (vasuliData) => {
  try {
    const response = await fetch(`https://5txvte0v46.execute-api.ap-southeast-1.amazonaws.com/dev/sendnotification/${vasuliData.vyapariId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: vasuliData.partyName,
        amount: vasuliData.amount,
      }),
    });

    const data = await response.json();
    console.log("Response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
};