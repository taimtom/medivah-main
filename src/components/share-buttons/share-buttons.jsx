'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

export function ShareButtons({ url, title, description }) {
  const theme = useTheme();
  const [copySuccess, setCopySuccess] = useState(false);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || CONFIG.site.serverUrl || 'https://www.mavidah.com';
  
  // Use provided URL or construct from current page
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = title || (typeof document !== 'undefined' ? document.title : '');
  const shareDescription = description || 'Check this out!';

  const handleShare = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    const encodedDescription = encodeURIComponent(shareDescription);

    let shareLink = '';

    switch (platform) {
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'copy':
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shareUrl).then(() => {
            setCopySuccess(true);
          });
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = shareUrl;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            document.execCommand('copy');
            setCopySuccess(true);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
          document.body.removeChild(textArea);
        }
        return;
      default:
        return;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400,noopener,noreferrer');
    }
  };

  const handleCloseSnackbar = () => {
    setCopySuccess(false);
  };

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <Tooltip title="Share on WhatsApp">
          <IconButton
            onClick={() => handleShare('whatsapp')}
            sx={{
              color: '#25D366',
              '&:hover': {
                bgcolor: 'rgba(37, 211, 102, 0.08)',
              },
            }}
          >
            <Iconify icon="ic:baseline-whatsapp" width={24} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Share on Twitter">
          <IconButton
            onClick={() => handleShare('twitter')}
            sx={{
              color: '#1DA1F2',
              '&:hover': {
                bgcolor: 'rgba(29, 161, 242, 0.08)',
              },
            }}
          >
            <Iconify icon="eva:twitter-fill" width={24} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Share on LinkedIn">
          <IconButton
            onClick={() => handleShare('linkedin')}
            sx={{
              color: '#0077B5',
              '&:hover': {
                bgcolor: 'rgba(0, 119, 181, 0.08)',
              },
            }}
          >
            <Iconify icon="eva:linkedin-fill" width={24} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Share on Facebook">
          <IconButton
            onClick={() => handleShare('facebook')}
            sx={{
              color: '#1877F2',
              '&:hover': {
                bgcolor: 'rgba(24, 119, 242, 0.08)',
              },
            }}
          >
            <Iconify icon="eva:facebook-fill" width={24} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Copy link">
          <IconButton
            onClick={() => handleShare('copy')}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Iconify icon="eva:link-2-fill" width={24} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
}
