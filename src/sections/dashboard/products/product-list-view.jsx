'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';

import { Iconify } from 'src/components/iconify';
import { supabase } from 'src/lib/supabase';
import { paths } from 'src/routes/paths';
import { useAuthContext } from 'src/auth/hooks';
import { scopeOwnedQuery } from 'src/lib/ownership';

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

// ----------------------------------------------------------------------

export function ProductListView() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const from = page * rowsPerPage;
      const to = from + rowsPerPage - 1;
      const { data, error, count } = await scopeOwnedQuery(
        supabase.from('products').select('*', { count: 'exact' }),
        user?.role,
        user?.id
      )
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setProducts(data || []);
      setTotalCount(count ?? 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role, page, rowsPerPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleMenuOpen = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    if (selectedProduct) {
      router.push(paths.dashboard.products.edit(selectedProduct.id));
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    setDeleting(true);
    try {
      const { error } = await scopeOwnedQuery(
        supabase.from('products').delete(),
        user?.role,
        user?.id
      ).eq('id', selectedProduct.id);

      if (error) throw error;

      const nextTotal = Math.max(0, totalCount - 1);
      const maxPage = Math.max(0, Math.ceil(nextTotal / rowsPerPage) - 1);
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      setTotalCount(nextTotal);
      if (page > maxPage) {
        setPage(maxPage);
      } else {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (product) => {
    try {
      const { error } = await scopeOwnedQuery(
        supabase.from('products').update({ published: !product.published }),
        user?.role,
        user?.id
      ).eq('id', product.id);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, published: !p.published } : p))
      );
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update product status');
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Product Management</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => router.push(paths.dashboard.products.new)}
          >
            New Product
          </Button>
        </Stack>

        {/* Table */}
        <Card>
          {loading && <LinearProgress />}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading && totalCount === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No products yet. Create your first one!
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{product.name}</Typography>
                        {product.description && (
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {product.description.substring(0, 60)}...
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.category && (
                          <Chip label={product.category} size="small" variant="soft" />
                        )}
                      </TableCell>
                      <TableCell>
                        {product.is_free ? (
                          <Chip label="FREE" color="success" size="small" />
                        ) : (
                          <Typography variant="body2">{formatPrice(product.price)}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.published ? 'Published' : 'Draft'}
                          size="small"
                          color={product.published ? 'success' : 'default'}
                          onClick={() => handleTogglePublish(product)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(product.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => handleMenuOpen(e, product)}>
                          <Iconify icon="eva:more-vertical-fill" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          />
        </Card>
      </Stack>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>
          <Iconify icon="solar:pen-bold" sx={{ mr: 2 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => !deleting && setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Product?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedProduct?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}


