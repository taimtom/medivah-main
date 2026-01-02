'use client';

import { useState } from 'react';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { RouterLink } from 'src/routes/components';
import { usePathname } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';
import { Logo } from 'src/components/logo';

// ----------------------------------------------------------------------

const NAV_ITEMS = [
  { title: 'Home', path: paths.home },
  { title: 'About', path: paths.about },
  { title: 'Blog', path: paths.blog.root },
  { title: 'Resources', path: paths.resources.root },
  { title: 'Jobs', path: paths.jobs },
  { title: 'Contact', path: paths.contact },
];

// ----------------------------------------------------------------------

export function Header() {
  const theme = useTheme();
  const pathname = usePathname();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path) => pathname === path;

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: 'background.paper',
          boxShadow: theme.customShadows.z8,
        }}
      >
        <Container>
          <Toolbar disableGutters sx={{ height: 80 }}>
            {/* Logo */}
            <Logo sx={{ mr: { xs: 2, md: 4 } }} />

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                {NAV_ITEMS.map((item) => (
                  <Button
                    key={item.title}
                    component={RouterLink}
                    href={item.path}
                    sx={{
                      color: isActive(item.path) ? 'primary.main' : 'text.primary',
                      fontWeight: isActive(item.path) ? 600 : 400,
                      '&:hover': {
                        color: 'primary.main',
                        bgcolor: 'transparent',
                      },
                    }}
                  >
                    {item.title}
                  </Button>
                ))}
              </Box>
            )}

            {/* Desktop Auth Button */}
            {!isMobile && (
              <Button
                component={RouterLink}
                href={paths.auth.supabase.signIn}
                variant="contained"
                startIcon={<Iconify icon="solar:login-3-bold-duotone" />}
              >
                Sign In
              </Button>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="end"
                  onClick={handleDrawerToggle}
                >
                  <Iconify icon="solar:hamburger-menu-bold-duotone" width={28} />
                </IconButton>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 280 },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Logo sx={{ mb: 3 }} />
          
          <List>
            {NAV_ITEMS.map((item) => (
              <ListItem key={item.title} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  href={item.path}
                  onClick={handleDrawerToggle}
                  selected={isActive(item.path)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                      fontWeight: 600,
                    },
                  }}
                >
                  <ListItemText primary={item.title} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 3 }}>
            <Button
              component={RouterLink}
              href={paths.auth.supabase.signIn}
              variant="contained"
              fullWidth
              startIcon={<Iconify icon="solar:login-3-bold-duotone" />}
              onClick={handleDrawerToggle}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}


