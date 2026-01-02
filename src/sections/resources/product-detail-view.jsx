'use client';

import { useState, useEffect } from 'react';

import { MainLayout } from 'src/layouts/main';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';
import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

export function ProductDetailView({ productId }) {
  const theme = useTheme();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('published', true)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price);
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 15 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <Container sx={{ py: 15, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Product Not Found
          </Typography>
          <Button
            component={RouterLink}
            href={paths.resources.root}
            variant="contained"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
            Back to Resources
          </Button>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container>
          <Button
          component={RouterLink}
          href={paths.resources.root}
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          sx={{ mb: 3 }}
        >
          Back to Resources
        </Button>

        <Grid container spacing={4}>
          {/* Product Image */}
          <Grid item xs={12} md={6}>
            {product.image_url ? (
              <Box
                component="img"
                src={product.image_url}
                alt={product.name}
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: theme.customShadows.z16,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: 400,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.grey[500], 0.12),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:gallery-bold-duotone" width={80} sx={{ color: 'text.disabled' }} />
              </Box>
            )}
          </Grid>

          {/* Product Details */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {product.category && (
                <Chip
                  label={product.category}
                  color="primary"
                  sx={{ width: 'fit-content' }}
                />
              )}

              <Typography variant="h3">{product.name}</Typography>

              <Typography variant="h4" color="primary.main">
                {formatPrice(product.price)}
              </Typography>

              <Divider />

              <Box>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                  {product.description}
                </Typography>
              </Box>

              <Divider />

              <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="solar:check-circle-bold-duotone" width={24} color="primary.main" />
                      <Typography variant="body2">
                        Instant digital download
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="solar:shield-check-bold-duotone" width={24} color="primary.main" />
                      <Typography variant="body2">
                        Secure payment with Paystack
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="solar:document-text-bold-duotone" width={24} color="primary.main" />
                      <Typography variant="body2">
                        Professional quality resources
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Button
                component={RouterLink}
                href={`${paths.resources.checkout}?product=${product.id}`}
                variant="contained"
                size="large"
                fullWidth
                startIcon={<Iconify icon="solar:cart-plus-bold-duotone" />}
              >
                Purchase Now
              </Button>

              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                By purchasing, you agree to our terms and conditions
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
    </MainLayout>
  );
}

