import { Resend } from 'resend';

// ----------------------------------------------------------------------

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send contact form email
 */
export async function sendContactEmail({ name, email, subject, message }) {
  try {
    const data = await resend.emails.send({
      from: 'Mavidah Contact <onboarding@resend.dev>', // Change this to your verified domain
      to: [process.env.CONTACT_EMAIL || 'contact@mavidah.com'],
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">New Contact Form Submission</h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3>Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          
          <hr style="border: 1px solid #e0e0e0; margin: 30px 0;" />
          
          <p style="color: #666; font-size: 12px;">
            This email was sent from the Mavidah contact form.
          </p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Resend email error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail({
  customerEmail,
  customerName,
  productName,
  amount,
  downloadLink,
}) {
  try {
    const data = await resend.emails.send({
      from: 'Mavidah <onboarding@resend.dev>', // Change this to your verified domain
      to: [customerEmail],
      subject: `Order Confirmation - ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">Thank You for Your Purchase!</h2>
          
          <p>Hi ${customerName},</p>
          
          <p>Thank you for purchasing <strong>${productName}</strong> from Mavidah.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Product:</strong> ${productName}</p>
            <p><strong>Amount Paid:</strong> ${amount}</p>
          </div>
          
          ${
            downloadLink
              ? `
            <div style="margin: 30px 0; text-align: center;">
              <a href="${downloadLink}" 
                 style="background-color: #1976d2; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Download Your Purchase
              </a>
            </div>
          `
              : ''
          }
          
          <p>If you have any questions, feel free to contact us at ${process.env.CONTACT_EMAIL || 'contact@mavidah.com'}.</p>
          
          <hr style="border: 1px solid #e0e0e0; margin: 30px 0;" />
          
          <p style="color: #666; font-size: 12px;">
            Thank you for choosing Mavidah - Your HR Knowledge Hub
          </p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Order confirmation email error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send newsletter email
 */
export async function sendNewsletterEmail({
  to,
  subject,
  html,
  preview_text,
  unsubscribeUrl,
  trackingPixelUrl,
}) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3030';
    const contactEmail = process.env.CONTACT_EMAIL || 'contact@mavidah.com';

    // Add tracking pixel and unsubscribe link to HTML
    const trackingPixel = trackingPixelUrl
      ? `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" />`
      : '';

    const unsubscribeFooter = unsubscribeUrl
      ? `
        <hr style="border: 1px solid #e0e0e0; margin: 30px 0;" />
        <div style="text-align: center; padding: 20px 0;">
          <p style="color: #666; font-size: 12px; margin: 10px 0;">
            You're receiving this because you subscribed to Mavidah's newsletter.
          </p>
          <p style="margin: 10px 0;">
            <a href="${unsubscribeUrl}" 
               style="color: #1976d2; text-decoration: none; font-size: 12px;">
              Unsubscribe
            </a>
          </p>
        </div>
      `
      : '';

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${preview_text ? `<meta name="description" content="${preview_text}">` : ''}
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background-color: #1976d2; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Mavidah</h1>
            <p style="color: #e3f2fd; margin: 5px 0 0 0; font-size: 14px;">Your HR Knowledge Hub</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            ${preview_text ? `<p style="color: #666; font-size: 14px; margin-bottom: 20px;">${preview_text}</p>` : ''}
            ${html}
          </div>
          
          ${unsubscribeFooter}
          
          <!-- Footer -->
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 5px 0;">
              © ${new Date().getFullYear()} Mavidah. All rights reserved.
            </p>
            <p style="color: #666; font-size: 12px; margin: 5px 0;">
              <a href="${baseUrl}" style="color: #1976d2; text-decoration: none;">Visit our website</a>
            </p>
            <p style="color: #666; font-size: 12px; margin: 5px 0;">
              Questions? Contact us at <a href="mailto:${contactEmail}" style="color: #1976d2; text-decoration: none;">${contactEmail}</a>
            </p>
          </div>
        </div>
        ${trackingPixel}
      </body>
      </html>
    `;

    const data = await resend.emails.send({
      from: 'Mavidah <onboarding@resend.dev>', // Change this to your verified domain
      to: [to],
      subject,
      html: fullHtml,
      text: html.replace(/<[^>]*>/g, '').replace(/\n\s*\n/g, '\n\n'), // Plain text fallback
    });

    return { success: true, data };
  } catch (error) {
    console.error('Newsletter email error:', error);
    return { success: false, error: error.message };
  }
}
