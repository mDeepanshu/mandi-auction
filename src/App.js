import './App.css';
import { Outlet } from "react-router-dom";
import NavBar from "./features/navbar/Nav-Bar";
import IndexedDBOpen from "./gateway/index-db-open";
import openDB from "./gateway/openDB";
import { Box } from '@mui/material';
import { setDB } from "./gateway/curdDB";

import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyC-JxvUJC-_M0WQRR3DBhprC0t20cMNjII",
  authDomain: "mandi-auction.firebaseapp.com",
  projectId: "mandi-auction",
  storageBucket: "mandi-auction.appspot.com",
  messagingSenderId: "118523225331",
  appId: "1:118523225331:web:3cab5f145b953b8a420386"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
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
  return (
    <>
      <NavBar></NavBar>
      <Box component="main" sx={{mt:8 }}>
        <Outlet />
      </Box>
    </>
  );
}

export default App;
