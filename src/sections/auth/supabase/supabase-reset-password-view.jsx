'use client';

import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { varAlpha } from 'src/theme/styles';

import { resetPassword } from 'src/auth/context/supabase';

const ResetPasswordSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
});

export function SupabaseResetPasswordView() {
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const methods = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      await resetPassword({ email });
      setSuccessMsg('Password reset link sent. Please check your inbox and spam folder.');
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Unable to send password reset link');
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
          color: 'primary.main',
        }}
      >
        <Iconify icon="solar:letter-bold-duotone" width={28} />
      </Box>

      <Stack spacing={1.5}>
        <Typography variant="h5">Reset your password</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Enter the email you use for Mavidah Dashboard. We will send you a link to set a new password.
        </Typography>
      </Stack>
    </Stack>
  );

  const renderFooter = (
    <Stack direction="row" spacing={0.5} sx={{ mt: 3 }} flexWrap="wrap">
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Remember your password?
      </Typography>
      <Link component={RouterLink} href={paths.auth.supabase.signIn} variant="subtitle2">
        Sign in
      </Link>
    </Stack>
  );

  return (
    <>
      {renderHead}

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}
      {!!successMsg && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMsg}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Field.Text name="email" label="Email address" InputLabelProps={{ shrink: true }} />

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            color="inherit"
            variant="contained"
            loading={isSubmitting}
            loadingIndicator="Sending..."
          >
            Send reset link
          </LoadingButton>
        </Stack>
      </Form>

      {renderFooter}
    </>
  );
}
