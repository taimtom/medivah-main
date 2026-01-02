'use client';

// Paystack initialization function
export const initializePaystack = ({ email, amount, reference, onSuccess, onClose }) => {
  const handler = window.PaystackPop.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    email,
    amount: amount * 100, // Convert to kobo
    currency: 'NGN',
    ref: reference,
    onClose: () => {
      if (onClose) onClose();
    },
    callback: (response) => {
      if (onSuccess) onSuccess(response);
    },
  });

  handler.openIframe();
};

// Generate a unique reference
export const generatePaystackReference = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `MVDH-${timestamp}-${random}`;
};


