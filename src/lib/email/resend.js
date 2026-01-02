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
      to: [process.env.CONTACT_EMAIL || 'contact@mavidah.co'],
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
  downloadLink 
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
          
          ${downloadLink ? `
            <div style="margin: 30px 0; text-align: center;">
              <a href="${downloadLink}" 
                 style="background-color: #1976d2; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Download Your Purchase
              </a>
            </div>
          ` : ''}
          
          <p>If you have any questions, feel free to contact us at ${process.env.CONTACT_EMAIL || 'contact@mavidah.co'}.</p>
          
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


