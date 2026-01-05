'use client';

// Paystack initialization function
export const initializePaystack = ({ email, amount, reference, onSuccess, onClose }) => {
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  if (!publicKey) {
    console.error('Paystack public key is not configured. Please check your environment variables.');
    alert('Payment system is not configured. Please contact support.');
    return;
  }

  if (!window.PaystackPop) {
    console.error('Paystack script is not loaded. Please check if the Paystack script is included in the page.');
    alert('Payment system is not available. Please refresh the page and try again.');
    return;
  }

  const handler = window.PaystackPop.setup({
    key: publicKey,
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


