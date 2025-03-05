import "./App.css";
import { Outlet } from "react-router-dom";
import NavBar from "./features/navbar/Nav-Bar";
import openDB from "./gateway/openDB";
import { deleteOldAuctionEntries } from "./gateway/curdDB";
import { Box } from "@mui/material";
import { setDB } from "./gateway/curdDB";
import { useState, useEffect } from "react";
import Login from "./features/login/login";
import RegisterDevice from "./dialogs/register-device/register-device";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const initializeDB = async () => {
  try {
    const database = await openDB();
    setDB(database);
  } catch (error) {
    console.error("Database initialization error:", error);
  }
};
initializeDB();

function App() {
  const [loginStatus, setLoginStatus] = useState(true);
  const [loading, setLoading] = useState({ isLoading: true, message: "Loading..." });
  const [unregistered, setUnregistered] = useState(false);
  const [openSuccessTransactionDialog, setSuccessTransactionDialog] = useState(false);

  const changeLoginState = (value) => {
    if (value === process.env.REACT_APP_PASS) {
      setTimeout(() => {
        setLoginStatus(false);
      }, 100);
    }
  };

  const changeLoading = (newState, apiRes) => {
    setLoading({ isLoading: newState, message: apiRes });
  };

  const deletePreviousWeekEntries = async () => {
    try {
      const data = await deleteOldAuctionEntries(Number(new Date() - 691200000));
    } catch (error) {
      setSuccessTransactionDialog(true);
    }
  };

  useEffect(() => {
    const init = async () => {
      await initializeDB();
      setLoading(false);
      deletePreviousWeekEntries();
    };
    init();
  }, []);

  useEffect(() => {
    if (!loginStatus) {
      if (localStorage.getItem("deviceId") === "" || localStorage.getItem("deviceId") === null) {
        setUnregistered(true);
      }
    }
  }, [loginStatus]);

  const handleCloseDialog = () => {
    setUnregistered(false);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccessTransactionDialog(false);
  };

  return (
    <>
      {loginStatus ? (
        <Login changeLoginState={changeLoginState} />
      ) : (
        <>
          {loading.isLoading ? (
            <div className="loader" />
          ) : (
            <>
              <NavBar changeLoadingState={changeLoading} loadingStatus={loading}></NavBar>
              <Box component="main">
                <Outlet context={{ loading }} />
              </Box>
            </>
          )}
        </>
      )}
      <div>
        <RegisterDevice open={unregistered} onClose={handleCloseDialog} />
        <div>
          <Snackbar open={openSuccessTransactionDialog} autoHideDuration={1000} onClose={handleClose} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
            <Alert onClose={handleClose} severity="error" variant="filled" sx={{ width: "100%" }}>
              OLD TRANSACTION CLEAR FAILED.
            </Alert>
          </Snackbar>
        </div>
      </div>
    </>
  );
}

export default App;
