import { NextResponse } from 'next/server';

import {
  sendContactEmail,
  sendOrderConfirmationEmail,
  sendNewsletterEmail,
} from 'src/lib/email/resend';

// ----------------------------------------------------------------------

/**
 * Test email delivery endpoint
 * 
 * Usage:
 * GET /api/email/test?type=contact&email=your@email.com
 * GET /api/email/test?type=order&email=your@email.com
 * GET /api/email/test?type=newsletter&email=your@email.com
 * GET /api/email/test?type=all&email=your@email.com
 * 
 * Or POST with JSON body:
 * {
 *   "type": "contact" | "order" | "newsletter" | "all",
 *   "email": "test@example.com"
 * }
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { 
          error: 'Email parameter is required',
          usage: {
            get: '/api/email/test?type=contact&email=your@email.com',
            post: 'POST /api/email/test with JSON body: { "type": "contact|order|newsletter|all", "email": "test@example.com" }'
          }
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const results = {
      timestamp: new Date().toISOString(),
      email,
      tests: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
      },
    };

    // Test Contact Email
    if (type === 'contact' || type === 'all') {
      results.summary.total++;
      try {
        const result = await sendContactEmail({
          name: 'Test User',
          email: email,
          subject: 'Test Email - Contact Form',
          message: 'This is a test email from the email testing function. If you receive this, the contact email functionality is working correctly.',
        });

        results.tests.contact = {
          success: result.success,
          data: result.data || null,
          error: result.error || null,
          details: result.details || null,
        };

        if (result.success) {
          results.summary.passed++;
        } else {
          results.summary.failed++;
        }
      } catch (error) {
        results.tests.contact = {
          success: false,
          error: error.message,
        };
        results.summary.failed++;
      }
    }

    // Test Order Confirmation Email
    if (type === 'order' || type === 'all') {
      results.summary.total++;
      try {
        const result = await sendOrderConfirmationEmail({
          customerEmail: email,
          customerName: 'Test Customer',
          productName: 'Test Product',
          amount: '$99.99',
          downloadLink: 'https://example.com/download/test',
        });

        results.tests.order = {
          success: result.success,
          data: result.data || null,
          error: result.error || null,
          details: result.details || null,
        };

        if (result.success) {
          results.summary.passed++;
        } else {
          results.summary.failed++;
        }
      } catch (error) {
        results.tests.order = {
          success: false,
          error: error.message,
        };
        results.summary.failed++;
      }
    }

    // Test Newsletter Email
    if (type === 'newsletter' || type === 'all') {
      results.summary.total++;
      try {
        const result = await sendNewsletterEmail({
          to: email,
          subject: 'Test Email - Newsletter',
          html: `
            <h2>Test Newsletter Email</h2>
            <p>This is a test email from the email testing function.</p>
            <p>If you receive this email, the newsletter email functionality is working correctly.</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>Timestamp: ${new Date().toISOString()}</li>
              <li>Email Type: Newsletter</li>
              <li>Status: Test Email</li>
            </ul>
          `,
          preview_text: 'This is a test newsletter email',
          unsubscribeUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3030'}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`,
          trackingPixelUrl: null,
        });

        results.tests.newsletter = {
          success: result.success,
          data: result.data || null,
          error: result.error || null,
          details: result.details || null,
        };

        if (result.success) {
          results.summary.passed++;
        } else {
          results.summary.failed++;
        }
      } catch (error) {
        results.tests.newsletter = {
          success: false,
          error: error.message,
        };
        results.summary.failed++;
      }
    }

    // Check environment configuration
    const config = {
      resendApiKey: process.env.RESEND_API_KEY ? 'Set' : 'Missing',
      contactEmail: process.env.CONTACT_EMAIL || 'Not set (using default)',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'Not set (using default)',
    };

    const statusCode = results.summary.failed === 0 ? 200 : 207; // 207 Multi-Status for partial success

    return NextResponse.json(
      {
        ...results,
        config,
        message: results.summary.failed === 0
          ? 'All email tests passed!'
          : `${results.summary.passed}/${results.summary.total} tests passed`,
      },
      { status: statusCode }
    );
  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json(
      {
        error: 'Failed to run email tests',
        message: error.message,
        config: {
          resendApiKey: process.env.RESEND_API_KEY ? 'Set' : 'Missing',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type = 'all', email } = body;

    if (!email) {
      return NextResponse.json(
        { 
          error: 'Email is required in request body',
          usage: {
            body: {
              type: 'contact | order | newsletter | all (optional, default: all)',
              email: 'test@example.com (required)'
            }
          }
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const results = {
      timestamp: new Date().toISOString(),
      email,
      tests: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
      },
    };

    // Test Contact Email
    if (type === 'contact' || type === 'all') {
      results.summary.total++;
      try {
        const result = await sendContactEmail({
          name: 'Test User',
          email: email,
          subject: 'Test Email - Contact Form',
          message: 'This is a test email from the email testing function. If you receive this, the contact email functionality is working correctly.',
        });

        results.tests.contact = {
          success: result.success,
          data: result.data || null,
          error: result.error || null,
          details: result.details || null,
        };

        if (result.success) {
          results.summary.passed++;
        } else {
          results.summary.failed++;
        }
      } catch (error) {
        results.tests.contact = {
          success: false,
          error: error.message,
        };
        results.summary.failed++;
      }
    }

    // Test Order Confirmation Email
    if (type === 'order' || type === 'all') {
      results.summary.total++;
      try {
        const result = await sendOrderConfirmationEmail({
          customerEmail: email,
          customerName: 'Test Customer',
          productName: 'Test Product',
          amount: '$99.99',
          downloadLink: 'https://example.com/download/test',
        });

        results.tests.order = {
          success: result.success,
          data: result.data || null,
          error: result.error || null,
          details: result.details || null,
        };

        if (result.success) {
          results.summary.passed++;
        } else {
          results.summary.failed++;
        }
      } catch (error) {
        results.tests.order = {
          success: false,
          error: error.message,
        };
        results.summary.failed++;
      }
    }

    // Test Newsletter Email
    if (type === 'newsletter' || type === 'all') {
      results.summary.total++;
      try {
        const result = await sendNewsletterEmail({
          to: email,
          subject: 'Test Email - Newsletter',
          html: `
            <h2>Test Newsletter Email</h2>
            <p>This is a test email from the email testing function.</p>
            <p>If you receive this email, the newsletter email functionality is working correctly.</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>Timestamp: ${new Date().toISOString()}</li>
              <li>Email Type: Newsletter</li>
              <li>Status: Test Email</li>
            </ul>
          `,
          preview_text: 'This is a test newsletter email',
          unsubscribeUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3030'}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`,
          trackingPixelUrl: null,
        });

        results.tests.newsletter = {
          success: result.success,
          data: result.data || null,
          error: result.error || null,
          details: result.details || null,
        };

        if (result.success) {
          results.summary.passed++;
        } else {
          results.summary.failed++;
        }
      } catch (error) {
        results.tests.newsletter = {
          success: false,
          error: error.message,
        };
        results.summary.failed++;
      }
    }

    // Check environment configuration
    const config = {
      resendApiKey: process.env.RESEND_API_KEY ? 'Set' : 'Missing',
      contactEmail: process.env.CONTACT_EMAIL || 'Not set (using default)',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'Not set (using default)',
    };

    const statusCode = results.summary.failed === 0 ? 200 : 207; // 207 Multi-Status for partial success

    return NextResponse.json(
      {
        ...results,
        config,
        message: results.summary.failed === 0
          ? 'All email tests passed!'
          : `${results.summary.passed}/${results.summary.total} tests passed`,
      },
      { status: statusCode }
    );
  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json(
      {
        error: 'Failed to run email tests',
        message: error.message,
        config: {
          resendApiKey: process.env.RESEND_API_KEY ? 'Set' : 'Missing',
        },
      },
      { status: 500 }
    );
  }
}
