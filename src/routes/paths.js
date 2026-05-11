// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  // PUBLIC PAGES
  home: '/',
  about: '/about',
  blog: {
    root: '/blog',
    post: (slug) => `/blog/${slug}`,
  },
  resources: {
    root: '/resources',
    product: (id) => `/resources/${id}`,
    checkout: '/resources/checkout',
  },
  jobs: {
    root: '/jobs',
    detail: (id) => `/jobs/${id}`,
  },
  contact: '/contact',
  disclosure: '/disclosure',
  privacy: '/privacy',
  terms: '/terms',
  faqs: '#', // Placeholder for FAQs page
  minimalStore: '#', // Placeholder for store link
  
  // AUTH
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
    },
  },
  
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    analytics: `${ROOTS.DASHBOARD}/analytics`,
    blog: {
      root: `${ROOTS.DASHBOARD}/blog`,
      new: `${ROOTS.DASHBOARD}/blog/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/blog/${id}/edit`,
    },
    comments: `${ROOTS.DASHBOARD}/comments`,
    products: {
      root: `${ROOTS.DASHBOARD}/products`,
      new: `${ROOTS.DASHBOARD}/products/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/products/${id}/edit`,
    },
    jobs: {
      root: `${ROOTS.DASHBOARD}/jobs`,
      new: `${ROOTS.DASHBOARD}/jobs/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/jobs/${id}/edit`,
    },
    applicant: {
      root: `${ROOTS.DASHBOARD}/applicant`,
      profile: `${ROOTS.DASHBOARD}/applicant/profile`,
      applications: `${ROOTS.DASHBOARD}/applicant/applications`,
      savedJobs: `${ROOTS.DASHBOARD}/applicant/saved-jobs`,
      notifications: `${ROOTS.DASHBOARD}/applicant/notifications`,
    },
    applications: {
      root: `${ROOTS.DASHBOARD}/applications`,
      applicant: (userId) => `${ROOTS.DASHBOARD}/applications/applicant/${userId}`,
    },
    verification: {
      root: `${ROOTS.DASHBOARD}/verification`,
    },
    billing: `${ROOTS.DASHBOARD}/billing`,
    orders: {
      root: `${ROOTS.DASHBOARD}/orders`,
      details: (id) => `${ROOTS.DASHBOARD}/orders/${id}`,
    },
    newsletter: {
      root: `${ROOTS.DASHBOARD}/newsletter`,
      subscribers: `${ROOTS.DASHBOARD}/newsletter/subscribers`,
      new: `${ROOTS.DASHBOARD}/newsletter/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/newsletter/${id}/edit`,
      preview: (id) => `${ROOTS.DASHBOARD}/newsletter/${id}/preview`,
      analytics: `${ROOTS.DASHBOARD}/newsletter/analytics`,
    },
  },
};
