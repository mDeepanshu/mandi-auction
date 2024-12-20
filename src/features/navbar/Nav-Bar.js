import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import PropTypes from 'prop-types';
import { AppBar, Box, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { syncAll } from "../../gateway/gateway";
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const navItems = [
    // { name: '', label: 'Home' },
    { name: 'auction-transaction', label: 'Auction Transaction' },
    { name: 'vasuli-transaction', label: 'Vasuli Transaction' },
    { name: 'party-master', label: 'Party Master' },
    { name: 'item-master', label: 'Item Master' },
];


function NavBar(props) {

    const { window } = props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [sync, setSync] = useState({});
    const [open, setOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const syncData = async () => {
        props.changeLoadingState(true);
        let data = await syncAll();
        props.changeLoadingState(false);
        setSync({
            syncSeverity: data ? 'success' : 'error',
            syncStatus: data ? 'SYNC SUCCESSFUL' : 'SYNC UNSUCCESSFUL'
        });
        setOpen(true);
    }


    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                MANDI
            </Typography>
            <Divider />
            <List>
                {navItems.map((item, index) => (
                    <Link to={item.name} key={index}>
                        <ListItem disablePadding>
                            <ListItemButton sx={{ textAlign: 'center' }}>
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        </ListItem>
                    </Link>
                ))}
                <Button sx={{ color: 'black' }} onClick={syncData}>Sync</Button>
            </List>
        </Box>
    );

    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar component="nav">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
                    >
                        MANDI
                    </Typography>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        {navItems.map((item, index) => (
                            <Link to={item.name} key={index}>
                                <Button sx={{ color: '#fff' }}>
                                    {item.label}
                                </Button>
                            </Link>
                        ))}
                        <Button sx={{ color: 'black' }} onClick={syncData}>Sync</Button>
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
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                    }}
                >
                    {drawer}
                </Drawer>
            </nav>
            <div>
                <Snackbar
                    open={open}
                    autoHideDuration={5000}
                    onClose={handleClose}
                >
                    <Alert
                        onClose={handleClose}
                        severity={sync.syncSeverity}
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {sync.syncStatus}
                    </Alert>
                </Snackbar>
            </div>
        </Box>
    );
}

export default NavBar;
