import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

export const signInWithPassword = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// ----------------------------------------------------------------------

export const signUp = async ({ email, password, firstName, lastName }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: `${firstName} ${lastName}`,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// ----------------------------------------------------------------------

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

// ----------------------------------------------------------------------

export const resetPassword = async ({ email }) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/supabase/update-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
};

// ----------------------------------------------------------------------

export const updatePassword = async ({ password }) => {
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw new Error(error.message);
  }
};


