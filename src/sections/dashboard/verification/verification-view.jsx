'use client';

import { useMemo, useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import CardContent from '@mui/material/CardContent';
import LoadingButton from '@mui/lab/LoadingButton';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useTheme, alpha } from '@mui/material/styles';

import { supabase } from 'src/lib/supabase';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

// ─── Constants ────────────────────────────────────────────────────────────────

const ADMIN_STATUSES = ['pending', 'in_review', 'approved', 'rejected', 'suspended'];

const STATUS_META = {
  pending: {
    severity: 'info',
    icon: 'solar:clock-circle-bold-duotone',
    label: 'Pending Review',
    description: 'Your verification request has been submitted and is awaiting review by our team.',
  },
  in_review: {
    severity: 'warning',
    icon: 'solar:eye-bold-duotone',
    label: 'Under Review',
    description: 'Our team is currently reviewing your organisation details.',
  },
  approved: {
    severity: 'success',
    icon: 'solar:verified-check-bold-duotone',
    label: 'Verified Organisation ✔',
    description: 'Your organisation has been verified. You can now post jobs and manage applicants.',
  },
  rejected: {
    severity: 'error',
    icon: 'solar:close-circle-bold-duotone',
    label: 'Not Approved',
    description: 'Your verification request was not approved. Please update your details and resubmit.',
  },
  suspended: {
    severity: 'error',
    icon: 'solar:shield-warning-bold-duotone',
    label: 'Suspended',
    description: 'Your verification has been suspended. Please contact support.',
  },
};

const EMPTY_FORM = {
  company_name: '',
  company_email: '',
  phone_number: '',
  domain: '',
  address: '',
  proof_type: 'registration_number',
  business_registration_number: '',
  document_file: null,
  document_path: '',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function uploadVerificationDoc(file, userId) {
  const ext = file.name.split('.').pop();
  const path = `verification-docs/${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('verification-docs')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  return path;
}

// ─── Verification status card (read-only) ────────────────────────────────────

function VerificationStatusCard({ verification }) {
  const theme = useTheme();
  const meta = STATUS_META[verification.status] || STATUS_META.pending;

  const isApproved = verification.status === 'approved';

  return (
    <Card
      sx={{
        border: `1px solid ${theme.palette[meta.severity]?.main || theme.palette.divider}`,
        background: alpha(theme.palette[meta.severity]?.main || '#000', 0.04),
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          {/* Status banner */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Iconify
              icon={meta.icon}
              width={28}
              color={`${meta.severity}.main`}
            />
            <Stack>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {meta.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {meta.description}
              </Typography>
            </Stack>
            {isApproved && (
              <Chip
                label="Verified"
                color="success"
                icon={<Iconify icon="solar:verified-check-bold-duotone" />}
                sx={{ ml: 'auto' }}
              />
            )}
          </Stack>

          <Divider />

          {/* Details grid */}
          <Stack spacing={1.5}>
            <DetailRow label="Organisation" value={verification.company_name} />
            <DetailRow label="Business Email" value={verification.company_email} />
            {verification.phone_number && (
              <DetailRow label="Phone" value={verification.phone_number} />
            )}
            {verification.domain && (
              <DetailRow label="Website" value={verification.domain} />
            )}
            {verification.address && (
              <DetailRow label="Address" value={verification.address} />
            )}
            {verification.business_registration_number && (
              <DetailRow label="Reg. Number" value={verification.business_registration_number} />
            )}
          </Stack>

          {verification.review_notes && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              <Typography variant="caption" fontWeight={600}>Admin note: </Typography>
              <Typography variant="caption">{verification.review_notes}</Typography>
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <Typography variant="caption" color="text.disabled" sx={{ minWidth: 110, pt: 0.25 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}

// ─── Verification form (member submit / resubmit) ────────────────────────────

function VerificationForm({ existingVerification, onSuccess }) {
  const { user } = useAuthContext();
  const fileRef = useRef();
  const [form, setForm] = useState(() => {
    if (!existingVerification) return EMPTY_FORM;
    return {
      company_name: existingVerification.company_name || '',
      company_email: existingVerification.company_email || '',
      phone_number: existingVerification.phone_number || '',
      domain: existingVerification.domain || '',
      address: existingVerification.address || '',
      proof_type: existingVerification.business_registration_number
        ? 'registration_number'
        : 'document_upload',
      business_registration_number: existingVerification.business_registration_number || '',
      document_file: null,
      document_path: '',
    };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, document_file: file, document_path: file ? file.name : '' }));
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.company_name || !form.company_email) {
      setError('Organisation name and business email are required.');
      return;
    }
    if (form.proof_type === 'registration_number' && !form.business_registration_number) {
      setError('Please enter your Business Registration Number.');
      return;
    }
    if (form.proof_type === 'document_upload' && !form.document_file && !existingVerification?.documents?.length) {
      setError('Please upload a supporting document.');
      return;
    }

    try {
      setSaving(true);
      let documentPath = null;

      if (form.proof_type === 'document_upload' && form.document_file) {
        documentPath = await uploadVerificationDoc(form.document_file, user.id);
      }

      const response = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: user.id,
          requester_name: user.displayName || '',
          requester_email: user.email || '',
          company_name: form.company_name,
          company_email: form.company_email,
          phone_number: form.phone_number || null,
          domain: form.domain || null,
          address: form.address || null,
          business_registration_number:
            form.proof_type === 'registration_number'
              ? form.business_registration_number
              : null,
          documents: documentPath ? [documentPath] : [],
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error || 'Could not submit verification request.');
        return;
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit verification request.');
    } finally {
      setSaving(false);
    }
  };

  const isResubmit = existingVerification?.status === 'rejected';

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Stack spacing={0.5}>
            <Typography variant="h6">
              {isResubmit ? 'Resubmit Verification Request' : 'Organisation Verification'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Verify your organisation to unlock job posting and recruiter tools.
            </Typography>
          </Stack>

          {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

          <Divider />

          {/* Organisation Details */}
          <Stack spacing={0.5}>
            <Typography variant="overline" color="text.secondary">
              Organisation Details
            </Typography>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Organisation Name"
              value={form.company_name}
              onChange={handleField('company_name')}
              fullWidth
              required
            />
            <TextField
              label="Business Email"
              type="email"
              value={form.company_email}
              onChange={handleField('company_email')}
              fullWidth
              required
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Phone Number"
              value={form.phone_number}
              onChange={handleField('phone_number')}
              fullWidth
              placeholder="+234 800 000 0000"
            />
            <TextField
              label="Website (optional)"
              value={form.domain}
              onChange={handleField('domain')}
              fullWidth
              placeholder="https://yourcompany.com"
            />
          </Stack>

          <TextField
            label="Organisation Address"
            value={form.address}
            onChange={handleField('address')}
            fullWidth
            multiline
            minRows={2}
            placeholder="Street, City, State, Country"
          />

          <Divider />

          {/* Verification Proof */}
          <Stack spacing={1.5}>
            <Typography variant="overline" color="text.secondary">
              Verification Proof — choose one
            </Typography>

            <RadioGroup
              value={form.proof_type}
              onChange={(e) => setForm((prev) => ({ ...prev, proof_type: e.target.value }))}
            >
              <FormControlLabel
                value="registration_number"
                control={<Radio />}
                label="Business Registration Number (e.g. CAC Number)"
              />
              <FormControlLabel
                value="document_upload"
                control={<Radio />}
                label="Upload Supporting Document"
              />
            </RadioGroup>

            {form.proof_type === 'registration_number' && (
              <TextField
                label="Business Registration Number"
                value={form.business_registration_number}
                onChange={handleField('business_registration_number')}
                fullWidth
                placeholder="e.g. RC-1234567"
              />
            )}

            {form.proof_type === 'document_upload' && (
              <Stack spacing={1}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<Iconify icon="solar:upload-bold-duotone" />}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {form.document_path ? 'Replace Document' : 'Upload Document'}
                  <input
                    hidden
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </Button>
                {form.document_path && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="solar:file-bold-duotone" width={18} color="success.main" />
                    <Typography variant="body2">{form.document_path}</Typography>
                  </Stack>
                )}
                {!form.document_path && existingVerification?.documents?.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Previously uploaded document retained unless you choose a new file.
                  </Typography>
                )}
              </Stack>
            )}
          </Stack>

          <LoadingButton
            variant="contained"
            loading={saving}
            onClick={handleSubmit}
            size="large"
            startIcon={<Iconify icon="solar:shield-check-bold-duotone" />}
          >
            {isResubmit ? 'Resubmit Request' : 'Submit for Verification'}
          </LoadingButton>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Admin panel ──────────────────────────────────────────────────────────────

function AdminVerificationPanel({ rows, onStatusUpdated }) {
  const { user } = useAuthContext();
  const [policy, setPolicy] = useState({ mode: 'grace_then_gate', deadline: '' });

  useEffect(() => {
    const fetchPolicy = async () => {
      const res = await fetch('/api/verification/policy');
      const result = await res.json();
      if (res.ok) setPolicy({ mode: result.mode || 'grace_then_gate', deadline: result.deadline || '' });
    };
    fetchPolicy();
  }, []);

  const updateStatus = async (verificationId, status) => {
    // eslint-disable-next-line no-alert
    const reviewNotes = window.prompt('Review notes (optional)', '') || null;
    const response = await fetch('/api/verification/review', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-actor-id': user.id },
      body: JSON.stringify({ id: verificationId, status, review_notes: reviewNotes }),
    });
    if (response.ok) onStatusUpdated();
  };

  const updatePolicy = async () => {
    await fetch('/api/verification/policy', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-actor-id': user.id },
      body: JSON.stringify({ mode: policy.mode, deadline: policy.deadline }),
    });
  };

  return (
    <Stack spacing={3}>
      {/* Policy card */}
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={700}>Verification Grace Policy</Typography>
            <Stack direction="row" spacing={2}>
              <Select
                size="small"
                value={policy.mode}
                onChange={(e) => setPolicy((p) => ({ ...p, mode: e.target.value }))}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="grace_then_gate">grace_then_gate</MenuItem>
                <MenuItem value="soft_badge">soft_badge</MenuItem>
              </Select>
              <TextField
                size="small"
                label="Grace deadline (ISO date)"
                value={policy.deadline}
                onChange={(e) => setPolicy((p) => ({ ...p, deadline: e.target.value }))}
              />
              <Button variant="contained" onClick={updatePolicy}>Save Policy</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Verification rows */}
      <Typography variant="h6">All Verification Requests ({rows.length})</Typography>
      <Stack spacing={2}>
        {rows.map((row) => (
          <Card key={row.id} variant="outlined">
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
                <Stack spacing={0.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1" fontWeight={700}>{row.company_name}</Typography>
                    <Chip
                      label={row.status}
                      size="small"
                      color={
                        row.status === 'approved' ? 'success'
                          : row.status === 'rejected' || row.status === 'suspended' ? 'error'
                            : row.status === 'in_review' ? 'warning' : 'default'
                      }
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{row.company_email}</Typography>
                  {row.phone_number && <Typography variant="caption" color="text.secondary">{row.phone_number}</Typography>}
                  {row.address && <Typography variant="caption" color="text.secondary">{row.address}</Typography>}
                  {row.business_registration_number && (
                    <Typography variant="caption">Reg: {row.business_registration_number}</Typography>
                  )}
                  {row.review_notes && (
                    <Typography variant="caption" color="error.main">Note: {row.review_notes}</Typography>
                  )}
                  <Typography variant="caption" color="text.disabled">
                    Submitted {new Date(row.created_at).toLocaleDateString()}
                  </Typography>
                </Stack>
                <Select
                  size="small"
                  value=""
                  displayEmpty
                  onChange={(e) => updateStatus(row.id, e.target.value)}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="" disabled>Update status</MenuItem>
                  {ADMIN_STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </Stack>
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && (
          <Typography color="text.secondary">No verification requests yet.</Typography>
        )}
      </Stack>
    </Stack>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function VerificationView() {
  const { user, checkUserSession } = useAuthContext();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const myVerification = useMemo(() => {
    if (user?.role === 'admin' || !rows.length) return null;
    return rows[0];
  }, [rows, user?.role]);

  const fetchRows = useCallback(async () => {
    if (!user?.id) return;
    const role = user.role === 'admin' ? 'admin' : 'member';
    const res = await fetch(`/api/verification?role=${role}&user_id=${user.id}`);
    const result = await res.json();
    if (res.ok) setRows(result.rows || []);
    setLoading(false);
  }, [user?.id, user?.role]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const handleSuccess = useCallback(async () => {
    await checkUserSession({ refreshProfile: true });
    fetchRows();
  }, [checkUserSession, fetchRows]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <LinearProgress />
      </Container>
    );
  }

  const showForm =
    user?.role !== 'admin' &&
    (!myVerification || myVerification.status === 'rejected');

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4">Employer Verification</Typography>
          <Typography variant="body2" color="text.secondary">
            Verify your organisation to unlock full recruiter capabilities.
          </Typography>
        </Stack>

        {/* Member views */}
        {user?.role !== 'admin' && (
          <>
            {myVerification && myVerification.status !== 'rejected' && (
              <VerificationStatusCard verification={myVerification} />
            )}
            {showForm && (
              <VerificationForm
                existingVerification={myVerification}
                onSuccess={handleSuccess}
              />
            )}
          </>
        )}

        {/* Admin view */}
        {user?.role === 'admin' && (
          <AdminVerificationPanel rows={rows} onStatusUpdated={fetchRows} />
        )}
      </Stack>
    </Container>
  );
}
