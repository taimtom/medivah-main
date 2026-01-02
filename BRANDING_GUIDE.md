# 🎨 Mavidah Branding Guide

## Logo Files

### Where to Add Logo Files

1. Create a `public/logo/` directory
2. Add your logo files:
   - `logo.svg` - Main logo
   - `logo-single.svg` - Icon only (for mobile/favicon)
   - `favicon.ico` - Browser favicon

### Update Logo Component

Edit `src/components/logo/logo.jsx`:

```jsx
'use client';

import { forwardRef } from 'react';

import Link from '@mui/material/Link';
import Box from '@mui/material/Box';

import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export const Logo = forwardRef(
  ({ width = 120, height = 40, disableLink = false, sx, ...other }, ref) => {
    const logo = (
      <Box
        component="img"
        src="/logo/logo.svg" // Your logo file
        alt="Mavidah"
        sx={{
          width,
          height,
          cursor: 'pointer',
          ...sx,
        }}
        {...other}
      />
    );

    if (disableLink) {
      return logo;
    }

    return (
      <Link component={RouterLink} href="/" sx={{ display: 'contents' }}>
        {logo}
      </Link>
    );
  }
);
```

## Theme Colors

Based on your logo description (green gradient, blue, yellow/gold accent), update the theme:

### Edit `src/theme/core/palette.js`

Find the `createPaletteChannel` function and update:

```javascript
export function createPaletteChannel(mode) {
  const palette = {
    // ... existing code

    primary: {
      // Mavidah Green
      lighter: '#C8FAD6',
      light: '#5BE49B',
      main: '#00A76F', // Change to your green
      dark: '#007867',
      darker: '#004B50',
      contrastText: '#FFFFFF',
    },
    secondary: {
      // Mavidah Blue
      lighter: '#D6E4FF',
      light: '#84A9FF',
      main: '#3366FF', // Change to your blue
      dark: '#1939B7',
      darker: '#091A7A',
      contrastText: '#FFFFFF',
    },
    warning: {
      // Mavidah Gold/Yellow accent
      lighter: '#FFF5CC',
      light: '#FFD666',
      main: '#FFAB00', // Change to your gold
      dark: '#B76E00',
      darker: '#7A4100',
      contrastText: '#1C252E',
    },
  };

  return palette;
}
```

### Your Specific Colors

Replace with your brand colors:

```javascript
primary: {
  main: '#10B981', // Example green - replace with yours
},
secondary: {
  main: '#3B82F6', // Example blue - replace with yours
},
warning: {
  main: '#F59E0B', // Example gold - replace with yours
},
```

## Favicon

### Create Favicon Files

1. Use a tool like https://realfavicongenerator.net/
2. Upload your logo
3. Download the generated files

### Add to `public/`

```
public/
  ├── favicon.ico
  ├── favicon-16x16.png
  ├── favicon-32x32.png
  ├── apple-touch-icon.png
  └── android-chrome-192x192.png
```

### Update `src/app/layout.jsx`

Add to the metadata:

```jsx
export const metadata = {
  title: {
    default: 'Mavidah - HR Knowledge & Career Growth',
    template: '%s | Mavidah',
  },
  description: 'Your trusted hub for HR knowledge, career guidance, and workplace insights.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};
```

## Typography (Optional)

### Use a Custom Font

1. Add Google Fonts to `src/app/layout.jsx`:

```jsx
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});
```

2. Update `src/theme/core/typography.js`:

```javascript
export const typography = {
  fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  // ... rest of config
};
```

## Social Media Images

### Add OG Images

Create social sharing images:

```
public/
  └── og/
      ├── og-image.jpg (1200x630px)
      ├── twitter-image.jpg (1200x600px)
      └── linkedin-image.jpg (1200x627px)
```

### Update Metadata

In `src/app/layout.jsx`:

```jsx
export const metadata = {
  // ... existing metadata
  openGraph: {
    title: 'Mavidah - HR Knowledge & Career Growth',
    description: 'Your trusted hub for HR knowledge, career guidance, and workplace insights.',
    url: 'https://mavidah.co',
    siteName: 'Mavidah',
    images: [
      {
        url: '/og/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mavidah - HR Knowledge & Career Growth',
    description: 'Your trusted hub for HR knowledge, career guidance, and workplace insights.',
    images: ['/og/twitter-image.jpg'],
  },
};
```

## Quick Color Update Checklist

- [ ] Add logo files to `public/logo/`
- [ ] Update Logo component to use your logo
- [ ] Update primary color (green) in palette.js
- [ ] Update secondary color (blue) in palette.js
- [ ] Update warning color (gold) in palette.js
- [ ] Add favicon files to `public/`
- [ ] Update metadata with icons
- [ ] (Optional) Add custom fonts
- [ ] (Optional) Add OG images for social media

## Testing Your Branding

After making changes:

1. Restart the dev server: `npm run dev`
2. Check logo appears in header and mobile menu
3. Check colors throughout the site
4. Check favicon in browser tab
5. Test social media sharing with OG debuggers:
   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator
   - LinkedIn: https://www.linkedin.com/post-inspector/

## Color Accessibility

Ensure your colors meet WCAG accessibility standards:

- Text contrast ratio: minimum 4.5:1
- Large text: minimum 3:1
- Use tools like https://webaim.org/resources/contrastchecker/

## Need Help?

The Material UI theme system is powerful. For more customization:

- [Material UI Theming Guide](https://mui.com/material-ui/customization/theming/)
- [Next.js Metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

