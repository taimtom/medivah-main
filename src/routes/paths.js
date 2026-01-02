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
  jobs: '/jobs',
  contact: '/contact',
  disclosure: '/disclosure',
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
    orders: {
      root: `${ROOTS.DASHBOARD}/orders`,
      details: (id) => `${ROOTS.DASHBOARD}/orders/${id}`,
    },
  },
};
