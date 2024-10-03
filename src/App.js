import './App.css';
import { Outlet } from "react-router-dom";
import NavBar from "./features/navbar/Nav-Bar";
import openDB from "./gateway/openDB";
import { Box } from '@mui/material';
import { setDB } from "./gateway/curdDB";
import { useState,useEffect } from 'react';

const initializeDB = async () => {
  try {
    const database = await openDB();
    setDB(database);
    console.log("db setting done");
    
  } catch (error) {
    console.error("Database initialization error:", error);
  }
};
initializeDB();

function App() {

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
  );
}

export default App;
