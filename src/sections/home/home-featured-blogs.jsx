'use client';

import { useState, useEffect } from 'react';

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
import Button from '@mui/material/Button';

import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

export function HomeFeaturedBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedBlogs();
  }, []);

  const fetchFeaturedBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (blogs.length === 0) {
    return null;
  }

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container>
        <Stack spacing={1} sx={{ mb: 5, textAlign: 'center' }}>
          <Typography variant="h2">Latest Insights</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Explore our latest HR knowledge and workplace insights
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {blogs.map((blog) => (
            <Grid item xs={12} md={4} key={blog.id}>
              <Card>
                <CardActionArea component={RouterLink} href={paths.blog.post(blog.slug)}>
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
                        <Chip label={blog.category} size="small" sx={{ width: 'fit-content' }} />
                      )}
                      <Typography variant="h6" gutterBottom>
                        {blog.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ height: 60, overflow: 'hidden' }}>
                        {blog.excerpt}
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 5, textAlign: 'center' }}>
          <Button
            component={RouterLink}
            href={paths.blog.root}
            variant="outlined"
            size="large"
          >
            View All Posts
          </Button>
        </Box>
      </Container>
    </Box>
  );
}


