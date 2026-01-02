import Box from '@mui/material/Box';

import { Header } from './header';
import { Footer } from './footer';

// ----------------------------------------------------------------------

export function MainLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      
      <Footer />
    </Box>
  );
}


