import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// import PropTypes from 'prop-types';
import { AppBar, Box, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { syncAll } from "../../gateway/gateway";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import RegisterDevice from "../../dialogs/register-device/register-device";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import styles from "./nav-bar.module.css";

const navItems = [
  { name: "auction-transaction", label: "AUCTION TXN." },
  { name: "all-entries", label: "ALL ENTRIES" },
];

const remNavItems = [
  { name: "item-master", label: "ITEM MASTER" },
  { name: "party-master", label: "PARTY MASTER" },
  { name: "vasuli-transaction", label: "VASULI TXN." },
  { name: "pending-vasuli", label: "PENDING VASULI" },
];

function NavBar(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sync, setSync] = useState({});
  const [open, setOpen] = useState(false);
  const [syncedData, setSyncedData] = useState();
  const [label, setLabel] = useState("AUCTION TXN.");

  const [unregistered, setUnregistered] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };
  const isMobile = useMediaQuery("(max-width:700px)");
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const closeMoreMenu = () => setAnchorEl(null);

  useEffect(() => {
    if (syncedData) {
      setSync({
        syncSeverity: syncedData === `done` ? "success" : "error",
        syncStatus: syncedData === `done` ? "SYNC SUCCESSFUL" : syncedData,
      });
      setOpen(true);
    }
  }, [syncedData]);

  useEffect(() => {
    setSyncedData(props.loadingStatus.message);
  }, [props.loadingStatus]);

  const syncData = async () => {
    if (localStorage.getItem("deviceId") === "" || localStorage.getItem("deviceId") === null) {
      setUnregistered(true);
    } else {
      props.changeLoadingState(true, `Syncing...`);
      let syncedDataStatus = await syncAll();
      props.changeLoadingState(false, syncedDataStatus);
    }
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        MANDI
      </Typography>
      <Divider />
      <List>
        {navItems?.map((item, index) => (
          <Link to={item.name} key={index}>
            <ListItem disablePadding>
              <ListItemButton sx={{ textAlign: "center" }}>
                <ListItemText primary={item.label} onClick={() => setLabel(item.label)}/>
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
        {remNavItems?.map((item, index) => (
          <Link to={item.name} key={index}>
            <ListItem disablePadding>
              <ListItemButton sx={{ textAlign: "center" }}>
                <ListItemText primary={item.label} onClick={() => setLabel(item.label)}/>
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
        <Button sx={{ color: "black" }} onClick={syncData}>
          Sync
        </Button>
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  const handleCloseDialog = () => {
    setUnregistered(false);
  };

  return (
    <>
      <Box className={styles.navbar}>
        <AppBar component="nav">
          <Toolbar variant="dense">
            <Typography sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}></Typography>
            <Typography sx={{ flexGrow: 1, display: { xs: 'block', sm: 'none' } }}>{label}</Typography>
            <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: "none" } }}>
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              {navItems?.map((item, index) => (
                <Link to={item.name} key={index}>
                  <Button sx={{ color: "#fff" }} onClick={() => setLabel(item.label)}>{item.label}</Button>
                </Link>
              ))}
              <Button id="basic-button" aria-controls={open ? "basic-menu" : undefined} aria-haspopup="true" aria-expanded={open ? "true" : undefined} onClick={handleClick} sx={{ color: "#fff" }}>
                MORE
              </Button>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={openMenu}
                onClose={closeMoreMenu}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
              >
                {remNavItems.map((item, index) => (
                  <MenuItem key={index} onClick={closeMoreMenu}>
                    <Link to={item.name} key={index}>
                      <Button key={item.name} onClick={() => setLabel(item.label)}>{item.label}</Button>
                    </Link>
                  </MenuItem>
                ))}
              </Menu>
              <Button sx={{ color: "black" }} onClick={syncData}>
                Sync
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        <nav>
          <Drawer
            container={container}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
            }}
          >
            {drawer}
          </Drawer>
        </nav>
      </Box>
      <div>
        <Snackbar open={open} autoHideDuration={5000} onClose={handleClose} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert onClose={handleClose} severity={sync.syncSeverity} variant="filled" sx={{ width: "100%" }}>
            {sync.syncStatus}
          </Alert>
        </Snackbar>
      </div>
      <div>
        <RegisterDevice open={unregistered} onClose={handleCloseDialog} />
      </div>
    </>
  );
}

export default NavBar;
