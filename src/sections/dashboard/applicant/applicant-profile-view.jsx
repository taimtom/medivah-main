'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Step from '@mui/material/Step';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stepper from '@mui/material/Stepper';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import StepLabel from '@mui/material/StepLabel';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import CardContent from '@mui/material/CardContent';
import Autocomplete from '@mui/material/Autocomplete';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { supabase } from 'src/lib/supabase';
import { calculateApplicantProfileCompletion } from 'src/lib/applicant-profile';
import { updatePassword } from 'src/auth/context/supabase';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

// ─── Constants ───────────────────────────────────────────────────────────────

const SKILL_SUGGESTIONS = [
  'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Critical Thinking',
  'Time Management', 'Adaptability', 'Creativity', 'Attention to Detail', 'Emotional Intelligence',
  'Conflict Resolution', 'Negotiation', 'Public Speaking', 'Presentation Skills', 'Decision Making',
  'Project Management', 'Strategic Planning', 'Research & Analysis', 'Report Writing',
  'Recruitment', 'Talent Acquisition', 'Onboarding', 'Performance Management', 'HR Policy',
  'Employee Relations', 'Training & Development', 'Payroll Management', 'Labour Law',
  'Microsoft Office', 'Excel', 'PowerPoint', 'Google Workspace', 'Data Analysis',
  'SQL', 'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Next.js',
  'Software Development', 'UI/UX Design', 'Figma', 'Agile / Scrum', 'Git',
  'Digital Marketing', 'SEO', 'Content Writing', 'Social Media Management',
  'Accounting', 'Budgeting', 'Financial Reporting', 'Auditing', 'Supply Chain',
  'Logistics', 'Procurement', 'Customer Service', 'Sales', 'Business Development',
];

const STEPS = [
  { label: 'Basic Info', description: 'Your name and location' },
  { label: 'Skills', description: 'What you bring to the table' },
  { label: 'Work Experience', description: 'Your career history' },
  { label: 'Education', description: 'Your academic background' },
  { label: 'CV Upload', description: 'Attach your CV document' },
];

const YEAR_OPTIONS = Array.from({ length: 60 }, (_, i) => String(new Date().getFullYear() - i));

const MONTH_OPTIONS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

/**
 * Renders two selects (Month + Year) that produce/consume a "YYYY-MM" string.
 *
 * - Each dropdown holds local state so selections are visible even when the
 *   other field is not yet filled.
 * - When `minValue` ("YYYY-MM") is supplied, years before the min year are
 *   disabled, and months before the min month are disabled for the min year.
 *   If the current value becomes invalid after minValue changes, it is cleared.
 */
function MonthYearPicker({ label, value = '', onChange, disabled = false, minValue = '' }) {
  const initParts = value ? value.split('-') : ['', ''];
  const [localYear, setLocalYear] = useState(initParts[0] || '');
  const [localMonth, setLocalMonth] = useState(initParts[1] || '');

  const [minYear, minMonth] = minValue ? minValue.split('-') : ['', ''];

  // Keep local state in sync when the parent resets or pre-fills the value,
  // and clear it if it has become earlier than the new minValue.
  useEffect(() => {
    const [y = '', m = ''] = value ? value.split('-') : [];
    if (minValue && value && value < minValue) {
      setLocalYear('');
      setLocalMonth('');
      onChange('');
    } else {
      setLocalYear(y);
      setLocalMonth(m);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, minValue]);

  const isYearDisabled = (y) => Boolean(minYear && y < minYear);

  const isMonthDisabled = (m) => Boolean(minYear && minMonth && localYear === minYear && m < minMonth);

  const handleYear = (e) => {
    const y = e.target.value;
    setLocalYear(y);
    // If we switched to the min year and the current month is now too early, clear the month
    let effectiveMonth = localMonth;
    if (y === minYear && minMonth && localMonth && localMonth < minMonth) {
      setLocalMonth('');
      effectiveMonth = '';
    }
    onChange(y && effectiveMonth ? `${y}-${effectiveMonth}` : '');
  };

  const handleMonth = (e) => {
    const m = e.target.value;
    setLocalMonth(m);
    onChange(localYear && m ? `${localYear}-${m}` : '');
  };

  return (
    <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="caption" color={disabled ? 'text.disabled' : 'text.secondary'}>
        {label}
      </Typography>
      <Stack direction="row" spacing={1}>
        <TextField
          select
          size="small"
          value={localMonth}
          onChange={handleMonth}
          disabled={disabled}
          sx={{ flex: 1 }}
          label="Month"
        >
          <MenuItem value="">— Month —</MenuItem>
          {MONTH_OPTIONS.map((m) => (
            <MenuItem key={m.value} value={m.value} disabled={isMonthDisabled(m.value)}>
              {m.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          value={localYear}
          onChange={handleYear}
          disabled={disabled}
          sx={{ width: 110 }}
          label="Year"
        >
          <MenuItem value="">— Year —</MenuItem>
          {YEAR_OPTIONS.map((y) => (
            <MenuItem key={y} value={y} disabled={isYearDisabled(y)}>
              {y}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Stack>
  );
}

function newWorkEntry() {
  return { id: crypto.randomUUID(), company: '', role: '', start_date: '', end_date: '', is_current: false, achievements: '' };
}

function newEducationEntry() {
  return { id: crypto.randomUUID(), institution: '', course: '', start_year: '', end_year: '', gpa: '', description: '' };
}

const initialForm = {
  full_name: '',
  location: '',
  skills: [],
  work_experience: [],
  education: [],
  cv_file_path: '',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    try { return JSON.parse(value); } catch { return []; }
  }
  return [];
}

async function getCvSignedUrl(filePath) {
  if (!filePath) return null;
  const { data } = await supabase.storage.from('applicant-cvs').createSignedUrl(filePath, 3600);
  return data?.signedUrl || null;
}

// ─── Step components ──────────────────────────────────────────────────────────

function StepBasicInfo({ formData, onChange }) {
  return (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        Let recruiters know who you are and where you are based.
      </Typography>
      <TextField
        label="Full name"
        name="full_name"
        value={formData.full_name}
        onChange={onChange}
        required
        fullWidth
      />
      <TextField
        label="Location"
        name="location"
        value={formData.location}
        onChange={onChange}
        placeholder="e.g. Lagos, Nigeria"
        fullWidth
      />
    </Stack>
  );
}

function StepSkills({ formData, onSkillsChange }) {
  return (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        Add at least one skill. You can type custom skills or pick from the suggestions.
      </Typography>
      <Autocomplete
        multiple
        freeSolo
        options={SKILL_SUGGESTIONS}
        value={formData.skills}
        onChange={(_, newValue) => onSkillsChange(newValue)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              key={option}
              label={option}
              size="small"
              variant="outlined"
              {...getTagProps({ index })}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Skills"
            placeholder={formData.skills.length === 0 ? 'Type a skill and press Enter, or pick from the list…' : ''}
          />
        )}
      />
    </Stack>
  );
}

function WorkEntryCard({ entry, index, onUpdate, onRemove }) {
  const handleField = (field) => (e) =>
    onUpdate(entry.id, { [field]: e.target.value });

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Experience {index + 1}</Typography>
          <Tooltip title="Remove this entry">
            <IconButton size="small" color="error" onClick={() => onRemove(entry.id)}>
              <Iconify icon="solar:trash-bin-trash-bold" width={18} />
            </IconButton>
          </Tooltip>
        </Stack>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Company"
              value={entry.company}
              onChange={handleField('company')}
              fullWidth
              required
            />
            <TextField
              label="Role / Job title"
              value={entry.role}
              onChange={handleField('role')}
              fullWidth
              required
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
            <MonthYearPicker
              label="Start date"
              value={entry.start_date}
              onChange={(val) => {
                // If the current end date is now before the new start date, clear it
                const patch = { start_date: val };
                if (val && entry.end_date && entry.end_date < val) patch.end_date = '';
                onUpdate(entry.id, patch);
              }}
            />
            <MonthYearPicker
              label={entry.is_current ? 'End date (Present)' : 'End date'}
              value={entry.end_date}
              onChange={(val) => onUpdate(entry.id, { end_date: val })}
              disabled={entry.is_current}
              minValue={entry.start_date || ''}
            />
          </Stack>
          <FormControlLabel
            control={
              <Checkbox
                checked={entry.is_current}
                onChange={(e) =>
                  onUpdate(entry.id, {
                    is_current: e.target.checked,
                    end_date: e.target.checked ? '' : entry.end_date,
                  })
                }
              />
            }
            label="I currently work here"
          />
          <TextField
            label="Achievements / Responsibilities"
            value={entry.achievements}
            onChange={handleField('achievements')}
            multiline
            minRows={3}
            fullWidth
            placeholder="Describe your key achievements, responsibilities, and impact…"
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

function StepWorkExperience({ formData, onUpdate, onAdd, onRemove }) {
  return (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        Add at least one work experience entry. Include your most recent roles first.
      </Typography>

      {formData.work_experience.length === 0 && (
        <Alert severity="info" icon={<Iconify icon="solar:suitcase-bold-duotone" />}>
          No work experience added yet. Click the button below to add your first entry.
        </Alert>
      )}

      {formData.work_experience.map((entry, index) => (
        <WorkEntryCard
          key={entry.id}
          entry={entry}
          index={index}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}

      <Button
        variant="outlined"
        startIcon={<Iconify icon="eva:plus-fill" />}
        onClick={onAdd}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add work experience
      </Button>
    </Stack>
  );
}

function EducationEntryCard({ entry, index, onUpdate, onRemove }) {
  const handleField = (field) => (e) =>
    onUpdate(entry.id, { [field]: e.target.value });

  const handleStartYear = (e) => {
    const y = e.target.value;
    // Clear end year if it would become earlier than the new start year
    const patch = { start_year: y };
    if (y && entry.end_year && entry.end_year < y) patch.end_year = '';
    onUpdate(entry.id, patch);
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Education {index + 1}</Typography>
          <Tooltip title="Remove this entry">
            <IconButton size="small" color="error" onClick={() => onRemove(entry.id)}>
              <Iconify icon="solar:trash-bin-trash-bold" width={18} />
            </IconButton>
          </Tooltip>
        </Stack>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Institution"
              value={entry.institution}
              onChange={handleField('institution')}
              fullWidth
              required
              placeholder="e.g. University of Lagos"
            />
            <TextField
              label="Course / Programme"
              value={entry.course}
              onChange={handleField('course')}
              fullWidth
              required
              placeholder="e.g. Computer Science"
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Start year"
              value={entry.start_year}
              onChange={handleStartYear}
              fullWidth
            >
              <MenuItem value="">— Select year —</MenuItem>
              {YEAR_OPTIONS.map((y) => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="End year"
              value={entry.end_year}
              onChange={handleField('end_year')}
              fullWidth
            >
              <MenuItem value="">— Select year —</MenuItem>
              {YEAR_OPTIONS.map((y) => (
                <MenuItem key={y} value={y} disabled={Boolean(entry.start_year && y < entry.start_year)}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="GPA (optional)"
              value={entry.gpa}
              onChange={handleField('gpa')}
              fullWidth
              placeholder="e.g. 4.5 / 5.0"
            />
          </Stack>
          <TextField
            label="Description / Achievements"
            value={entry.description}
            onChange={handleField('description')}
            multiline
            minRows={3}
            fullWidth
            placeholder="Thesis, honours, notable projects, activities…"
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

function StepEducation({ formData, onUpdate, onAdd, onRemove }) {
  return (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        Add at least one education entry. Start with your highest qualification.
      </Typography>

      {formData.education.length === 0 && (
        <Alert severity="info" icon={<Iconify icon="solar:book-bold-duotone" />}>
          No education added yet. Click the button below to add your first entry.
        </Alert>
      )}

      {formData.education.map((entry, index) => (
        <EducationEntryCard
          key={entry.id}
          entry={entry}
          index={index}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}

      <Button
        variant="outlined"
        startIcon={<Iconify icon="eva:plus-fill" />}
        onClick={onAdd}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add education
      </Button>
    </Stack>
  );
}

function StepCvUpload({ formData, cvSignedUrl, uploadingCv, onUpload }) {
  return (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        Upload your CV in PDF, DOC, or DOCX format. Recruiters will be able to download it.
      </Typography>

      <Stack spacing={1}>
        <Button
          component="label"
          variant="outlined"
          startIcon={<Iconify icon="solar:upload-bold-duotone" />}
          disabled={uploadingCv}
          sx={{ alignSelf: 'flex-start' }}
        >
          {uploadingCv ? 'Uploading…' : formData.cv_file_path ? 'Replace CV' : 'Upload CV'}
          <input hidden type="file" accept=".pdf,.doc,.docx" onChange={onUpload} />
        </Button>

        {formData.cv_file_path ? (
          cvSignedUrl ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="solar:file-bold-duotone" width={18} color="success.main" />
              <Typography variant="body2">
                CV uploaded —{' '}
                <a href={cvSignedUrl} target="_blank" rel="noopener noreferrer">
                  View / Download
                </a>
              </Typography>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="solar:file-bold-duotone" width={18} color="success.main" />
              <Typography variant="body2" color="text.secondary">
                CV is uploaded
              </Typography>
            </Stack>
          )
        ) : (
          <Alert severity="warning" sx={{ alignSelf: 'flex-start' }}>
            No CV uploaded yet. Adding a CV improves your application visibility.
          </Alert>
        )}
      </Stack>
    </Stack>
  );
}

// ─── Completion bar ───────────────────────────────────────────────────────────

function ProfileCompletionBar({ completion }) {
  return (
    <Stack spacing={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Profile completion
        </Typography>
        <Chip
          size="small"
          label={`${completion}%`}
          color={completion >= 80 ? 'success' : completion >= 40 ? 'warning' : 'default'}
        />
      </Stack>
      <LinearProgress
        variant="determinate"
        value={completion}
        sx={{ height: 8, borderRadius: 1 }}
        color={completion >= 80 ? 'success' : completion >= 40 ? 'warning' : 'inherit'}
      />
      <Stack direction="row" justifyContent="space-between">
        {STEPS.map((step, i) => (
          <Tooltip key={step.label} title={`${step.label} — +20%`}>
            <Typography variant="caption" color={completion >= (i + 1) * 20 ? 'success.main' : 'text.disabled'} sx={{ fontSize: '0.6rem' }}>
              {step.label}
            </Typography>
          </Tooltip>
        ))}
      </Stack>
    </Stack>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function ApplicantProfileView() {
  const { user, checkUserSession } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState(initialForm);
  const [cvSignedUrl, setCvSignedUrl] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Live completion based on current form state (not just the server value)
  const profileCompletion = useMemo(
    () => calculateApplicantProfileCompletion(formData),
    [formData]
  );

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const response = await fetch(`/api/applicant/profile?user_id=${user.id}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to load profile');

        if (result.profile) {
          const p = result.profile;
          const cvPath = p.cv_file_path || '';
          setFormData({
            full_name: p.full_name || '',
            location: p.location || '',
            skills: Array.isArray(p.skills) ? p.skills : [],
            work_experience: parseJsonArray(p.work_experience),
            education: parseJsonArray(p.education),
            cv_file_path: cvPath,
          });
          if (cvPath) {
            const url = await getCvSignedUrl(cvPath);
            setCvSignedUrl(url);
          }
        }
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  // ── Field helpers ──────────────────────────────────────────────────────────

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSkillsChange = useCallback((newSkills) => {
    setFormData((prev) => ({ ...prev, skills: newSkills }));
  }, []);

  // Work experience
  const addWorkEntry = useCallback(() => {
    setFormData((prev) => ({ ...prev, work_experience: [...prev.work_experience, newWorkEntry()] }));
  }, []);

  const updateWorkEntry = useCallback((id, patch) => {
    setFormData((prev) => ({
      ...prev,
      work_experience: prev.work_experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }, []);

  const removeWorkEntry = useCallback((id) => {
    setFormData((prev) => ({
      ...prev,
      work_experience: prev.work_experience.filter((e) => e.id !== id),
    }));
  }, []);

  // Education
  const addEducationEntry = useCallback(() => {
    setFormData((prev) => ({ ...prev, education: [...prev.education, newEducationEntry()] }));
  }, []);

  const updateEducationEntry = useCallback((id, patch) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }, []);

  const removeEducationEntry = useCallback((id) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  }, []);

  // CV upload
  const handleCvUpload = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;
    try {
      setUploadingCv(true);
      const extension = file.name.split('.').pop();
      const filePath = `applicant-cvs/${user.id}/${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from('applicant-cvs')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;
      setFormData((prev) => ({ ...prev, cv_file_path: filePath }));
      const url = await getCvSignedUrl(filePath);
      setCvSignedUrl(url);
    } catch (uploadErr) {
      setError(uploadErr.message || 'Failed to upload CV');
    } finally {
      setUploadingCv(false);
    }
  }, [user?.id]);

  // ── Save ───────────────────────────────────────────────────────────────────

  const saveProfile = useCallback(async ({ showSuccess = false } = {}) => {
    if (!user?.id) return false;
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/applicant/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, ...formData }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save profile');

      await checkUserSession({ refreshProfile: true });
      if (showSuccess) setSuccess('Profile saved successfully!');
      return true;
    } catch (submitError) {
      setError(submitError.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [checkUserSession, formData, user?.id]);

  // ── Stepper navigation ─────────────────────────────────────────────────────

  const handleNext = useCallback(async () => {
    const ok = await saveProfile();
    if (ok) setActiveStep((s) => s + 1);
  }, [saveProfile]);

  const handleBack = useCallback(() => {
    setActiveStep((s) => s - 1);
    setError('');
    setSuccess('');
  }, []);

  const handleFinish = useCallback(async () => {
    await saveProfile({ showSuccess: true });
  }, [saveProfile]);

  const handlePasswordChange = useCallback((event) => {
    const { name, value } = event.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const submitPasswordChange = useCallback(async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirm password must match.');
      return;
    }

    try {
      setPasswordSaving(true);
      await updatePassword({ password: passwordData.newPassword });
      setPasswordSuccess('Password changed successfully.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (submitError) {
      setPasswordError(submitError instanceof Error ? submitError.message : 'Unable to change password.');
    } finally {
      setPasswordSaving(false);
    }
  }, [passwordData]);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <LinearProgress />
      </Container>
    );
  }

  const isLastStep = activeStep === STEPS.length - 1;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h4">Talent Profile</Typography>

        {/* Completion bar */}
        <Card>
          <CardContent>
            <ProfileCompletionBar completion={profileCompletion} />
          </CardContent>
        </Card>

        {/* Stepper header */}
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((step, index) => (
            <Step key={step.label} completed={index < activeStep}>
              <StepLabel
                optional={
                  <Typography variant="caption" color="text.secondary">
                    {step.description}
                  </Typography>
                }
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step content */}
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Step {activeStep + 1}: {STEPS[activeStep].label}
                </Typography>
                <Chip
                  size="small"
                  label={`${activeStep + 1} / ${STEPS.length}`}
                  variant="outlined"
                />
              </Stack>

              <Divider />

              {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}

              {/* Step panels */}
              {activeStep === 0 && (
                <StepBasicInfo formData={formData} onChange={handleChange} />
              )}
              {activeStep === 1 && (
                <StepSkills formData={formData} onSkillsChange={handleSkillsChange} />
              )}
              {activeStep === 2 && (
                <StepWorkExperience
                  formData={formData}
                  onUpdate={updateWorkEntry}
                  onAdd={addWorkEntry}
                  onRemove={removeWorkEntry}
                />
              )}
              {activeStep === 3 && (
                <StepEducation
                  formData={formData}
                  onUpdate={updateEducationEntry}
                  onAdd={addEducationEntry}
                  onRemove={removeEducationEntry}
                />
              )}
              {activeStep === 4 && (
                <StepCvUpload
                  formData={formData}
                  cvSignedUrl={cvSignedUrl}
                  uploadingCv={uploadingCv}
                  onUpload={handleCvUpload}
                />
              )}

              <Divider />

              {/* Navigation */}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Button
                  variant="outlined"
                  disabled={activeStep === 0 || saving}
                  onClick={handleBack}
                  startIcon={<Iconify icon="eva:arrow-back-fill" />}
                >
                  Back
                </Button>

                <Box>
                  {isLastStep ? (
                    <LoadingButton
                      variant="contained"
                      loading={saving}
                      onClick={handleFinish}
                      startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                      color="success"
                    >
                      Finish
                    </LoadingButton>
                  ) : (
                    <LoadingButton
                      variant="contained"
                      loading={saving}
                      onClick={handleNext}
                      endIcon={<Iconify icon="eva:arrow-forward-fill" />}
                    >
                      Save &amp; Next
                    </LoadingButton>
                  )}
                </Box>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack spacing={2.5}>
              <Typography variant="h6">Change Password</Typography>
              <Typography variant="body2" color="text.secondary">
                Update your dashboard password to keep your account secure.
              </Typography>

              {passwordError && (
                <Alert severity="error" onClose={() => setPasswordError('')}>
                  {passwordError}
                </Alert>
              )}
              {passwordSuccess && (
                <Alert severity="success" onClose={() => setPasswordSuccess('')}>
                  {passwordSuccess}
                </Alert>
              )}

              <TextField
                name="currentPassword"
                label="Current password (optional)"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                fullWidth
              />
              <TextField
                required
                name="newPassword"
                label="New password"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                fullWidth
              />
              <TextField
                required
                name="confirmPassword"
                label="Confirm new password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                fullWidth
              />

              <Stack direction="row" justifyContent="flex-end">
                <LoadingButton
                  variant="contained"
                  loading={passwordSaving}
                  onClick={submitPasswordChange}
                >
                  Update password
                </LoadingButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
