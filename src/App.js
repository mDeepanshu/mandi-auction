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

  const changeLoginState = (value) => {
    setLoginStatus(value)
  }
  const [loading, setLoading] = useState(true);

  const changeLoading = (newState) => {
    setLoading(newState);
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
            {loading ? (
              <div className="loader" />
            ) : (
              <>
                <NavBar changeLoadingState={changeLoading}></NavBar>
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
