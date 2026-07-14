import axios from "axios";
import config from "../constants/config";

const crateHttp = axios.create({
  baseURL: config.mandiLambdaApiUrl,
});

export const fetchCrateList = async () => {
  try {
    const response = await crateHttp.get("/crate");
    const crateList = response.data.responseBody || [];
    localStorage.setItem("crateList", JSON.stringify(crateList));
    return crateList;
  } catch (error) {
    console.error("Error fetching crate list:", error);
    return JSON.parse(localStorage.getItem("crateList") || "[]");
  }
};

export const addCrateIssues = (crateIssues) => {
  if (!crateIssues.length) return;
  try {
    const recordsArray = JSON.parse(localStorage.getItem("localObj") || "{}");
    recordsArray.crateIssue = [...(recordsArray.crateIssue || []), ...crateIssues];
    localStorage.setItem("localObj", JSON.stringify(recordsArray));
  } catch (error) {
    console.error("Error queueing crate issues:", error);
  }
};

// Fire and forget: sync status must not depend on this (crate APIs are under test)
export const syncCrateIssues = async () => {
  try {
    const crateIssues = JSON.parse(localStorage.getItem("localObj") || "{}").crateIssue || [];
    if (!crateIssues.length) return;

    const results = await Promise.allSettled(crateIssues.map((issue) => crateHttp.post("/crate/issue", issue)));
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error("Crate issue sync failed:", crateIssues[index], result.reason);
      }
    });

    const failed = crateIssues.filter((_, index) => results[index].status === "rejected");
    const localObj = JSON.parse(localStorage.getItem("localObj") || "{}");
    // keep failed entries plus any queued while the posts were in flight
    localObj.crateIssue = [...failed, ...(localObj.crateIssue || []).slice(crateIssues.length)];
    localStorage.setItem("localObj", JSON.stringify(localObj));
  } catch (error) {
    console.error("Crate issue sync errored:", error);
  }
};
