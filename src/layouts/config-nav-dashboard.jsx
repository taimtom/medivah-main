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

export const navData = [
  /**
   * Overview
   */
  {
    subheader: 'Overview',
    items: [
      { title: 'Analytics', path: paths.dashboard.root, icon: ICONS.analytics },
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
    ],
  },
  /**
   * Sales & Orders
   */
  {
    subheader: 'Sales',
    items: [
      { title: 'Orders', path: paths.dashboard.orders.root, icon: ICONS.order },
    ],
  },
];
