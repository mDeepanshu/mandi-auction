import './App.css';
import { Outlet } from "react-router-dom";
import NavBar from "./features/navbar/Nav-Bar";
import openDB from "./gateway/openDB";
import { Box } from '@mui/material';
import { setDB } from "./gateway/curdDB";
import { useState, useEffect } from 'react';
import Login from "./features/login/login";

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
  const [loading, setLoading] = useState({isLoading:true, message:"Loading..."});

  const changeLoginState = (value) => {
    if (value === process.env.REACT_APP_PASS) {
      setTimeout(() => {
        setLoginStatus(false);
      }, 100);
    }
  }

  const changeLoading = (newState,apiRes) => {
    setLoading({isLoading:newState, message:apiRes});
  }

  useEffect(() => {
    const init = async () => {
      await initializeDB();
      setLoading(false);
    };

    init();
  }, []);


  return (
    <>
      {
        loginStatus ? (<Login changeLoginState={changeLoginState} />) : (
          <>
            {loading.isLoading ? (
              <div className="loader" />
            ) : (
              <>
                <NavBar changeLoadingState={changeLoading} loadingStatus={loading}></NavBar>
                <Box component="main" sx={{ mt: 8 }}>
                  <Outlet context={{ loading }} />
                </Box>
              </>
            )}
          </>
        )}
    </>
  );
}

export default App;
