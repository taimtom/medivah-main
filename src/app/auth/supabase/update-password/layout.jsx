import { AuthSplitLayout } from 'src/layouts/auth-split';

// No GuestGuard — this page must be reachable after clicking a password reset link,
// which establishes a Supabase session for a previously logged-out user.

export default function Layout({ children }) {
  return (
    <AuthSplitLayout
      section={{
        title: 'Choose a new password',
        subtitle: 'Use a strong password you have not used before.',
      }}
    >
      {children}
    </AuthSplitLayout>
  );
}
