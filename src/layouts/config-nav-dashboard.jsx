import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
};

// ----------------------------------------------------------------------

const ADMIN_NAV = [
  /**
   * Overview
   */
  {
    subheader: 'Overview',
    items: [
      { title: 'Super Admin Home', path: paths.dashboard.root, icon: ICONS.analytics },
    ],
  },
  /**
   * Content Management
   */
  {
    subheader: 'Content',
    items: [
      { title: 'Blog Posts', path: paths.dashboard.blog.root, icon: ICONS.blog },
      { title: 'Comments', path: paths.dashboard.comments, icon: ICONS.chat },
      { title: 'Products', path: paths.dashboard.products.root, icon: ICONS.product },
      { title: 'Jobs', path: paths.dashboard.jobs.root, icon: ICONS.job },
      { title: 'Applications Received', path: paths.dashboard.applications.root, icon: ICONS.file },
      { title: 'Employer Verification', path: paths.dashboard.verification.root, icon: ICONS.lock },
    ],
  },
  /**
   * Sales & Orders
   */
  {
    subheader: 'Sales',
    items: [
      { title: 'Orders', path: paths.dashboard.orders.root, icon: ICONS.order },
      { title: 'Credits & Billing', path: paths.dashboard.billing, icon: ICONS.banking },
    ],
  },
  /**
   * Marketing
   */
  {
    subheader: 'Marketing',
    items: [
      { title: 'Newsletters', path: paths.dashboard.newsletter.root, icon: ICONS.mail },
      { title: 'Subscribers', path: paths.dashboard.newsletter.subscribers, icon: ICONS.user },
    ],
  },
];

const APPLICANT_NAV = [
  {
    subheader: 'Overview',
    items: [{ title: 'Dashboard Home', path: paths.dashboard.root, icon: ICONS.dashboard }],
  },
  {
    subheader: 'Profile',
    items: [{ title: 'Talent Profile', path: paths.dashboard.applicant.profile, icon: ICONS.user }],
  },
  {
    subheader: 'Applications',
    items: [
      { title: 'My Applications', path: paths.dashboard.applicant.applications, icon: ICONS.file },
      { title: 'Saved Jobs', path: paths.dashboard.applicant.savedJobs, icon: ICONS.folder },
      { title: 'Browse Jobs', path: paths.jobs.root, icon: ICONS.job },
    ],
  },
  {
    subheader: 'Account',
    items: [
      { title: 'Notifications', path: paths.dashboard.applicant.notifications, icon: ICONS.mail },
    ],
  },
];

const RECRUITER_NAV = [
  {
    subheader: 'Overview',
    items: [{ title: 'Dashboard Home', path: paths.dashboard.root, icon: ICONS.dashboard }],
  },
  {
    subheader: 'Profile',
    items: [{ title: 'Verification', path: paths.dashboard.verification.root, icon: ICONS.lock }],
  },
  {
    subheader: 'Jobs',
    items: [
      { title: 'Post Job', path: paths.dashboard.jobs.new, icon: ICONS.job },
      { title: 'My Jobs', path: paths.dashboard.jobs.root, icon: ICONS.job },
      { title: 'Applicants', path: paths.dashboard.applications.root, icon: ICONS.file },
    ],
  },
  {
    subheader: 'Performance',
    items: [{ title: 'Analytics', path: paths.dashboard.analytics, icon: ICONS.analytics }],
  },
  {
    subheader: 'Billing',
    items: [{ title: 'Credits & Billing', path: paths.dashboard.billing, icon: ICONS.banking }],
  },
  {
    subheader: 'Account',
    items: [{ title: 'Notifications', path: paths.dashboard.applicant.notifications, icon: ICONS.mail }],
  },
];

export const navData = ADMIN_NAV;

export function getDashboardNavDataByRole(role = 'recruiter') {
  if (role === 'admin') return ADMIN_NAV;
  if (role === 'applicant') return APPLICANT_NAV;
  if (role === 'recruiter' || role === 'member') return RECRUITER_NAV;
  return RECRUITER_NAV;
}
