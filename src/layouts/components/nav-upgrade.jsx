import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

export function NavUpgrade({ sx, ...other }) {
  return (
    <Stack sx={{ px: 2, py: 2, textAlign: 'center', ...sx }} {...other}>
      <Button
        variant="outlined"
        size="small"
        href="https://mavidah.co"
        target="_blank"
        rel="noopener"
        fullWidth
        sx={{
          color: 'var(--layout-nav-text-secondary-color)',
          borderColor: 'var(--layout-nav-border-color)',
          '&:hover': {
            borderColor: 'var(--layout-nav-text-primary-color)',
            color: 'var(--layout-nav-text-primary-color)',
            bgcolor: 'transparent',
          },
        }}
      >
        Visit Website
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function UpgradeBlock({ sx, ...other }) {
  return (
    <Stack
      sx={{
        ...bgGradient({
          color: `135deg, ${hexAlpha('#F7BB95', 0.92)}, ${hexAlpha('#5B2FF3', 0.92)}`,
          imgUrl: `${CONFIG.site.basePath}/assets/background/background-7.webp`,
        }),
        px: 3,
        py: 4,
        borderRadius: 2,
        position: 'relative',
        ...sx,
      }}
      {...other}
    >
      <Box
        sx={{
          top: 0,
          left: 0,
          width: 1,
          height: 1,
          borderRadius: 2,
          position: 'absolute',
          border: (theme) => `solid 3px ${varAlpha(theme.vars.palette.common.whiteChannel, 0.16)}`,
        }}
      />

      <Box
        component={m.img}
        animate={{ y: [12, -12, 12] }}
        transition={{
          duration: 8,
          ease: 'linear',
          repeat: Infinity,
          repeatDelay: 0,
        }}
        alt="Small Rocket"
        src={`${CONFIG.site.basePath}/assets/illustrations/illustration-rocket-small.webp`}
        sx={{ right: 0, width: 112, height: 112, position: 'absolute' }}
      />

      <Stack alignItems="flex-start" sx={{ position: 'relative' }}>
        <Box component="span" sx={{ typography: 'h5', color: 'common.white' }}>
          35% OFF
        </Box>

        <Box
          component="span"
          sx={{
            mb: 2,
            mt: 0.5,
            color: 'common.white',
            typography: 'subtitle2',
          }}
        >
          Power up Productivity!
        </Box>

        <Button variant="contained" size="small" color="warning">
          Upgrade to Pro
        </Button>
      </Stack>
    </Stack>
  );
}
