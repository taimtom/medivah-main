'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';

import { Iconify } from 'src/components/iconify';
import { supabase } from 'src/lib/supabase';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

const CATEGORIES = [
  'Templates & Tools',
  'Guides & Tips',
  'Learning & Courses',
  'Research & Insights',
];

export function ProductFormView({ id }) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    file_url: '',
    published: false,
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();

      if (error) throw error;
      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        price: data.price || '',
        category: data.category || '',
        image_url: data.image_url || '',
        file_url: data.file_url || '',
        published: data.published || false,
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'published' ? checked : value,
    }));

    // Auto-generate slug from product name
    if (name === 'name' && !id) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Ensure slug is generated if missing
      let slug = formData.slug;
      if (!slug && formData.name) {
        slug = formData.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
      }

      const productData = {
        ...formData,
        slug,
        price: parseFloat(formData.price),
        updated_at: new Date().toISOString(),
      };

      if (id) {
        const { error } = await supabase.from('products').update(productData).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
      }

      router.push(paths.dashboard.products.root);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4">{id ? 'Edit Product' : 'New Product'}</Typography>
            <Button
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => router.push(paths.dashboard.products.root)}
            >
              Back
            </Button>
          </Stack>

          <Card>
            <CardContent>
              <Stack spacing={3}>
                <TextField
                  name="name"
                  label="Product Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <TextField
                  name="slug"
                  label="Slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  fullWidth
                  helperText="URL-friendly version of the product name (auto-generated)"
                />

                <TextField
                  name="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                  fullWidth
                />

                <TextField
                  name="price"
                  label="Price (NGN)"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                />

                <TextField
                  name="category"
                  label="Category"
                  value={formData.category}
                  onChange={handleChange}
                  select
                  required
                  fullWidth
                >
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  name="image_url"
                  label="Product Image URL"
                  value={formData.image_url}
                  onChange={handleChange}
                  fullWidth
                  helperText="URL of the product image"
                />

                <TextField
                  name="file_url"
                  label="Download File URL"
                  value={formData.file_url}
                  onChange={handleChange}
                  fullWidth
                  helperText="URL of the digital product file"
                />

                <FormControlLabel
                  control={
                    <Switch name="published" checked={formData.published} onChange={handleChange} />
                  }
                  label="Published"
                />
              </Stack>
            </CardContent>
          </Card>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => router.push(paths.dashboard.products.root)}>
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={saving}
              startIcon={<Iconify icon="mingcute:save-line" />}
            >
              {id ? 'Update Product' : 'Create Product'}
            </LoadingButton>
          </Stack>
        </Stack>
      </form>
    </Container>
  );
}
