'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

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
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';

import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

const CATEGORIES = ['All', 'HR Basics', 'Career Growth', 'Workplace Culture', 'Leadership', 'Recruitment'];
const ITEMS_PER_PAGE = 9;

// ----------------------------------------------------------------------

export function BlogListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const rawPageParam = searchParams.get('page');
  const pageParam = Number(rawPageParam || '1');
  const hasInvalidPageParam = rawPageParam !== null && (Number.isNaN(pageParam) || pageParam < 1);
  const currentPage = hasInvalidPageParam ? 1 : pageParam;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const updatePageInUrl = useCallback(
    (page) => {
      const params = new URLSearchParams(searchParams.toString());

      if (page <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(page));
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('blogs')
        .select('id, title, slug, excerpt, featured_image, category, published_at, read_time', { count: 'exact' })
        .eq('published', true)
        .order('published_at', { ascending: false })
        .range(start, end);

      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      }

      if (debouncedSearchQuery) {
        query = query.or(`title.ilike.%${debouncedSearchQuery}%,excerpt.ilike.%${debouncedSearchQuery}%`);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      const safeTotalCount = count ?? 0;
      const safeTotalPages = Math.max(1, Math.ceil(safeTotalCount / ITEMS_PER_PAGE));

      if (safeTotalCount > 0 && currentPage > safeTotalPages) {
        updatePageInUrl(safeTotalPages);
        return;
      }

      if (safeTotalCount === 0 && currentPage !== 1) {
        updatePageInUrl(1);
        return;
      }

      setBlogs(data || []);
      setTotalCount(safeTotalCount);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchQuery, selectedCategory, updatePageInUrl]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    if (hasInvalidPageParam) {
      updatePageInUrl(1);
    }
  }, [hasInvalidPageParam, updatePageInUrl]);

  const handleSearchChange = useCallback(
    (event) => {
      setSearchQuery(event.target.value);
      if (currentPage !== 1) {
        updatePageInUrl(1);
      }
    },
    [currentPage, updatePageInUrl]
  );

  const handleCategoryChange = useCallback(
    (event) => {
      setSelectedCategory(event.target.value);
      if (currentPage !== 1) {
        updatePageInUrl(1);
      }
    },
    [currentPage, updatePageInUrl]
  );

  return (
    <MainLayout>
      <Box sx={{ py: { xs: 8, md: 10 } }}>
      <Container>
        {/* Header */}
        <Stack spacing={3} sx={{ mb: 5 }}>
          <Typography variant="h2" sx={{ textAlign: 'center' }}>
            Blog
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            Insights on careers, leadership, and growth in the modern workplace.
          </Typography>

          {/* Search and Filter */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}
          >
            <TextField
              fullWidth
              placeholder="Search posts..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              value={selectedCategory}
              onChange={handleCategoryChange}
              sx={{ minWidth: 200 }}
            >
              {CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>

        {/* Blog Posts */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : blogs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No blog posts found
            </Typography>
          </Box>
        ) : (
          <Stack spacing={4}>
            <Grid container spacing={3}>
              {blogs.map((blog) => (
                <Grid item xs={12} sm={6} md={4} key={blog.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardActionArea
                      component={RouterLink}
                      href={paths.blog.post(blog.slug)}
                      sx={{ flexGrow: 1 }}
                    >
                      {blog.featured_image && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={blog.featured_image}
                          alt={blog.title}
                        />
                      )}
                      <CardContent>
                        <Stack spacing={2}>
                          {blog.category && (
                            <Chip
                              label={blog.category}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ width: 'fit-content' }}
                            />
                          )}
                          <Typography variant="h6" gutterBottom>
                            {blog.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {blog.excerpt}
                          </Typography>
                          {blog.published_at && (
                            <Typography variant="caption" color="text.disabled">
                              {new Date(blog.published_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </Typography>
                          )}
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Stack alignItems="center">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => updatePageInUrl(page)}
                  color="primary"
                />
              </Stack>
            )}
          </Stack>
        )}
      </Container>
    </Box>
    </MainLayout>
  );
}

