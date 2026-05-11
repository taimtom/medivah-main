import { AuthSplitLayout } from 'src/layouts/auth-split';

import { GuestGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  return (
    <GuestGuard>
      <AuthSplitLayout
        section={{
          title: 'Forgot your password?',
          subtitle: 'We will email you a secure link so you can choose a new password.',
        }}
      >
        {children}
      </AuthSplitLayout>
    </GuestGuard>
  );
}
