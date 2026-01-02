// Google Analytics 4 configuration

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
};

// Custom events for Mavidah
export const trackBlogView = (blogTitle) => {
  event({
    action: 'view_blog_post',
    category: 'Blog',
    label: blogTitle,
  });
};

export const trackProductView = (productName) => {
  event({
    action: 'view_product',
    category: 'Products',
    label: productName,
  });
};

export const trackPurchase = (productName, value) => {
  event({
    action: 'purchase',
    category: 'E-commerce',
    label: productName,
    value,
  });
};

export const trackJobView = (jobTitle) => {
  event({
    action: 'view_job',
    category: 'Jobs',
    label: jobTitle,
  });
};

export const trackContactForm = () => {
  event({
    action: 'submit_contact_form',
    category: 'Contact',
    label: 'Contact Form Submission',
  });
};


