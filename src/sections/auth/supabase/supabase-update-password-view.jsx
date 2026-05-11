'use client';

import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { Field, Form } from 'src/components/hook-form';
import { updatePassword } from 'src/auth/context/supabase';

const UpdatePasswordSchema = zod
  .object({
    password: zod
      .string()
      .min(1, { message: 'New password is required!' })
      .min(6, { message: 'Password must be at least 6 characters!' }),
    confirmPassword: zod.string().min(1, { message: 'Please confirm your new password!' }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export function SupabaseUpdatePasswordView() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const methods = useForm({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError('');
      setSuccess('');
      await updatePassword({ password: values.password });
      setSuccess('Password updated successfully. Redirecting to sign in...');
      setTimeout(() => {
        router.push(paths.auth.supabase.signIn);
      }, 1200);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to update password');
    }
  });

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h5">Set new password</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Use a strong password you have not used before.
        </Typography>
      </Stack>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}
      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={2}>
          <Field.Text name="password" label="New password" type="password" />
          <Field.Text name="confirmPassword" label="Confirm new password" type="password" />
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Update password
          </LoadingButton>
        </Stack>
      </Form>
      <Link component={RouterLink} href={paths.auth.supabase.signIn} variant="body2" color="inherit">
        Back to sign in
      </Link>
    </Stack>
  );
}
