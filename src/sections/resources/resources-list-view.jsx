'use client';

import { useState, useEffect, useCallback } from 'react';

import { MainLayout } from 'src/layouts/main';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';

import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

const CATEGORIES = [
  'All',
  'Templates & Tools',
  'Guides & Tips',
  'Learning & Courses',
  'Research & Insights',
];

// ----------------------------------------------------------------------

export function ResourcesListView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price);
  };

  return (
    <MainLayout>
      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container>
          {/* Header */}
        <Stack spacing={3} sx={{ mb: 5 }}>
          <Typography variant="h2" sx={{ textAlign: 'center' }}>
            Resources
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            Professional tools, templates, guides, and courses for HR excellence
          </Typography>

          {/* Category Filter */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ 
              maxWidth: 600, 
              mx: 'auto', 
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <TextField
              select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              sx={{ minWidth: 250 }}
              label="Category"
            >
              {CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>

        {/* Products */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No resources available yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check back soon for professional HR tools and resources
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea
                    component={RouterLink}
                    href={paths.resources.product(product.id)}
                    sx={{ flexGrow: 1 }}
                  >
                    {product.image_url && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={product.image_url}
                        alt={product.name}
                      />
                    )}
                    <CardContent>
                      <Stack spacing={2}>
                        {product.category && (
                          <Chip
                            label={product.category}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ width: 'fit-content' }}
                          />
                        )}
                        <Typography variant="h6" gutterBottom>
                          {product.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            minHeight: 40,
                          }}
                        >
                          {product.description}
                        </Typography>
                        <Typography variant="h5" color="primary.main">
                          {formatPrice(product.price)}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      component={RouterLink}
                      href={paths.resources.product(product.id)}
                      variant="contained"
                      fullWidth
                    >
                      View Details
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
    </MainLayout>
  );
}

