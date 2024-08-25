import './App.css';
import { Outlet } from "react-router-dom";
import NavBar from "./features/navbar/Nav-Bar";
import openDB from "./gateway/openDB";
import { Box } from '@mui/material';
import { setDB } from "./gateway/curdDB";
import { useState } from 'react';

// Initialize Firebase
// IndexedDBOpen();
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

  const [loading, setLoading] = useState(false);

  const changeLoading = (newState) => {
    setLoading(newState);
  }

  return (
    <>
      <div className="loader" hidden={!loading} />
      <div hidden={loading}>
        <NavBar changeLoadingState={changeLoading}></NavBar>
        <Box component="main" sx={{ mt: 8 }}>
          <Outlet context={{ loading }} />
        </Box>
      </div>
    </>
  );
}

export default App;
