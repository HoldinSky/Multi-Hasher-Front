import {
    AppBar,
    Box, Button,
    CssBaseline,
    Divider, Drawer, IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Toolbar,
    Typography
} from "@mui/material";
import {useState} from "react";
import MenuIcon from '@mui/icons-material/Menu';
import {Link} from "react-router-dom";

const drawerWidth = 240;
const navItems = ['Home'];

export default function NavigationBar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{textAlign: 'center'}}>
            <Typography variant="h6" sx={{my: 2}}>
                Multi-Hasher 3000
            </Typography>
            <Divider/>
            <List>
                {navItems.map((item) => (
                    <ListItem key={item} disablePadding>
                        <ListItemButton sx={{textAlign: 'center'}} href={item === 'Home' ? "/" : "#"}>
                            <ListItemText primary={item}/>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    const container = window !== undefined ? () => document.body : undefined;

    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>
            <AppBar component="nav" color="primary">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{mr: 2, display: {sm: 'none'}}}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{flexGrow: 1, display: {xs: 'none', sm: 'block'}}}
                    >
                        <Link to={"/hashing"} style={{textDecoration: "none", color: "#3272ff"}}>Multi-Hasher 3000</Link>
                    </Typography>
                    <Box sx={{display: {xs: 'none', sm: 'block'}}}>
                        {navItems.map((item) => (
                            <Button key={item} color="secondary" style={{fontWeight: "bolder"}} href={item === 'Home' ? "/" : (item === "Calculate Hash" ? "/hashing" : "/")}>
                                {item}
                            </Button>
                        ))}
                    </Box>
                </Toolbar>
            </AppBar>
            <Box component="nav">
                <Drawer
                    container={container}
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: {xs: 'block', sm: 'none'},
                        '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box component="main" sx={{p: 3}}>
                <Toolbar/>
            </Box>
        </Box>
    );
}
