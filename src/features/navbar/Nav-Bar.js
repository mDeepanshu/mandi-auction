import React from 'react';
import { Link } from 'react-router-dom';
// import PropTypes from 'prop-types';
import { AppBar, Box, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { syncAll } from "../../gateway/gateway";
const drawerWidth = 240;
const navItems = [
    { name: '', label: 'Home' },
    { name: 'auction-transaction', label: 'Auction Transaction' },
    // { name: 'item-master', label: 'Item Master' },
    // { name: 'party-master', label: 'Party Master' },
    { name: 'vasuli-transaction', label: 'Vasuli Transaction' },
];


function NavBar(props) {

    const { window } = props;
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const syncData = async () => {
        props.changeLoadingState(true);
        let syncStatus = await syncAll();
        console.log(syncStatus);
        props.changeLoadingState(false);
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
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
            </nav>
        </Box>
    );
}

export default NavBar;
