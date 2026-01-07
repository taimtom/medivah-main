'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';

import { Iconify } from 'src/components/iconify';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

const STATUS_COLORS = {
  draft: 'default',
  scheduled: 'info',
  sending: 'warning',
  sent: 'success',
  failed: 'error',
};

export function NewsletterListView() {
  const router = useRouter();
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  const fetchNewsletters = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/api/newsletter/list';
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setNewsletters(data.newsletters || []);
      }
    } catch (error) {
      console.error('Error fetching newsletters:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchNewsletters();
  }, [fetchNewsletters]);

  const handleMenuOpen = (event, newsletter) => {
    setAnchorEl(event.currentTarget);
    setSelectedNewsletter(newsletter);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    if (selectedNewsletter) {
      router.push(paths.dashboard.newsletter.edit(selectedNewsletter.id));
    }
    handleMenuClose();
  };

  const handlePreview = () => {
    if (selectedNewsletter) {
      router.push(paths.dashboard.newsletter.preview(selectedNewsletter.id));
    }
    handleMenuClose();
  };

  const handleSendTest = () => {
    setTestEmailDialogOpen(true);
    handleMenuClose();
  };

  const handleSendTestEmail = async () => {
    if (!selectedNewsletter || !testEmail) return;

    setSending(true);
    try {
      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsletter_id: selectedNewsletter.id,
          test_email: testEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Test email sent successfully!');
        setTestEmailDialogOpen(false);
        setTestEmail('');
      } else {
        alert(data.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Send test email error:', error);
      alert('Failed to send test email');
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => {
    setSendDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmSend = async () => {
    if (!selectedNewsletter) return;

    setSending(true);
    try {
      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsletter_id: selectedNewsletter.id,
          source_filter: sourceFilter || 'all',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Newsletter sent! ${data.sent} sent, ${data.failed} failed`);
        setSendDialogOpen(false);
        fetchNewsletters();
      } else {
        alert(data.error || 'Failed to send newsletter');
      }
    } catch (error) {
      console.error('Send newsletter error:', error);
      alert('Failed to send newsletter');
    } finally {
      setSending(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Newsletters</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => router.push(paths.dashboard.newsletter.new)}
          >
            New Newsletter
          </Button>
        </Stack>

        <TextField
          select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 200 }}
          label="Status"
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="scheduled">Scheduled</MenuItem>
          <MenuItem value="sending">Sending</MenuItem>
          <MenuItem value="sent">Sent</MenuItem>
          <MenuItem value="failed">Failed</MenuItem>
        </TextField>

        <Card>
          {loading && <LinearProgress />}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subject</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Recipients</TableCell>
                  <TableCell>Opens</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Sent</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {newsletters.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No newsletters yet. Create your first one!
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  newsletters.map((newsletter) => (
                    <TableRow key={newsletter.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{newsletter.subject}</Typography>
                        {newsletter.preview_text && (
                          <Typography variant="caption" color="text.secondary">
                            {newsletter.preview_text}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={newsletter.status} size="small" color={STATUS_COLORS[newsletter.status]} />
                      </TableCell>
                      <TableCell>{newsletter.recipients_count || 0}</TableCell>
                      <TableCell>{newsletter.opened_count || 0}</TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(newsletter.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {newsletter.sent_at ? new Date(newsletter.sent_at).toLocaleDateString() : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => handleMenuOpen(e, newsletter)}>
                          <Iconify icon="eva:more-vertical-fill" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Stack>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>
          <Iconify icon="solar:pen-bold" sx={{ mr: 2 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handlePreview}>
          <Iconify icon="solar:eye-bold" sx={{ mr: 2 }} />
          Preview
        </MenuItem>
        {selectedNewsletter?.status === 'sent' && (
          <MenuItem onClick={() => router.push(`${paths.dashboard.newsletter.root}/analytics?id=${selectedNewsletter.id}`)}>
            <Iconify icon="solar:chart-bold-duotone" sx={{ mr: 2 }} />
            View Analytics
          </MenuItem>
        )}
        {selectedNewsletter?.status === 'draft' && (
          <MenuItem onClick={handleSendTest}>
            <Iconify icon="solar:letter-bold-duotone" sx={{ mr: 2 }} />
            Send Test Email
          </MenuItem>
        )}
        {selectedNewsletter?.status === 'draft' && (
          <MenuItem onClick={handleSend}>
            <Iconify icon="solar:rocket-bold-duotone" sx={{ mr: 2 }} />
            Send to All
          </MenuItem>
        )}
      </Menu>

      {/* Send Confirmation Dialog */}
      <Dialog open={sendDialogOpen} onClose={() => !sending && setSendDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Newsletter</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <DialogContentText>
              Are you sure you want to send "{selectedNewsletter?.subject}"? This action cannot be undone.
            </DialogContentText>

            <FormControl fullWidth>
              <InputLabel>Send to Segment</InputLabel>
              <Select
                value={sourceFilter}
                label="Send to Segment"
                onChange={(e) => setSourceFilter(e.target.value)}
                disabled={sending}
              >
                <MenuItem value="all">All Subscribers</MenuItem>
                <MenuItem value="manual">Manual Signups</MenuItem>
                <MenuItem value="purchase">Purchase Subscribers</MenuItem>
                <MenuItem value="signup">Signup Form</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialogOpen(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleConfirmSend} color="primary" disabled={sending}>
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={testEmailDialogOpen} onClose={() => !sending && setTestEmailDialogOpen(false)}>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Test Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            disabled={sending}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestEmailDialogOpen(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSendTestEmail} color="primary" disabled={sending || !testEmail}>
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

