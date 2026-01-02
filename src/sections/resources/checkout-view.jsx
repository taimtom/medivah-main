'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';
import { supabase } from 'src/lib/supabase';
import { MainLayout } from 'src/layouts/main';

// ----------------------------------------------------------------------

export function CheckoutView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('product');

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (productId) {
      fetchProduct();
    } else {
      setLoading(false);
    }
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckout = async () => {
    if (!formData.name || !formData.email) {
      alert('Please fill in all fields');
      return;
    }

    setProcessing(true);

    try {
      // Initialize Paystack
      const { initializePaystack, generatePaystackReference } = await import('src/lib/paystack/client');
      
      const reference = generatePaystackReference();

      initializePaystack({
        email: formData.email,
        amount: product.price,
        reference,
        onSuccess: async (response) => {
          // Verify payment and create order
          try {
            // Verify payment
            const verifyResponse = await fetch(`/api/paystack/verify?reference=${response.reference}`);
            const verifyData = await verifyResponse.json();

            if (verifyData.data && verifyData.data.status === 'success') {
              // Create order
              const orderResponse = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  product_id: product.id,
                  customer_email: formData.email,
                  amount: product.price,
                  paystack_reference: response.reference,
                }),
              });

              if (orderResponse.ok) {
                alert('Payment successful! Check your email for the product download link.');
                router.push('/resources');
              } else {
                throw new Error('Failed to create order');
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Error processing payment:', error);
            alert('Payment was successful but there was an error processing your order. Please contact support with reference: ' + response.reference);
          } finally {
            setProcessing(false);
          }
        },
        onClose: () => {
          setProcessing(false);
        },
      });
    } catch (error) {
      console.error('Paystack error:', error);
      alert('Failed to initialize payment. Please try again.');
      setProcessing(false);
    }
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
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            The product you're trying to purchase doesn't exist or is no longer available.
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
        <Container maxWidth="md">
        <Button
          component={RouterLink}
          href={paths.resources.product(product.id)}
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          sx={{ mb: 3 }}
        >
          Back to Product
        </Button>

        <Typography variant="h3" sx={{ mb: 5 }}>
          Checkout
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Note:</strong> Paystack payment integration is currently being set up. 
            This is a preview of the checkout flow.
          </Typography>
        </Alert>

        <Stack spacing={3}>
          {/* Order Summary */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1">{product.name}</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatPrice(product.price)}
                  </Typography>
                </Stack>
                
                <Divider />
                
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="primary.main">
                    {formatPrice(product.price)}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Billing Information */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Billing Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  helperText="We'll send your purchase receipt and download link to this email"
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Payment Button */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleCheckout}
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : <Iconify icon="solar:card-bold-duotone" />}
          >
            {processing ? 'Processing...' : `Pay ${formatPrice(product.price)}`}
          </Button>

          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
            Secured by Paystack. Your payment information is encrypted and secure.
          </Typography>
        </Stack>
      </Container>
    </Box>
    </MainLayout>
  );
}

