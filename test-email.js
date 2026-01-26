#!/usr/bin/env node

/**
 * Email Test Script
 * 
 * This script tests email delivery functionality by calling the test API endpoint.
 * 
 * Usage:
 *   node test-email.js your@email.com
 *   node test-email.js your@email.com contact
 *   node test-email.js your@email.com order
 *   node test-email.js your@email.com newsletter
 *   node test-email.js your@email.com all
 * 
 * Or set environment variables:
 *   TEST_EMAIL=your@email.com node test-email.js
 *   TEST_EMAIL=your@email.com TEST_TYPE=contact node test-email.js
 */

const email = process.argv[2] || process.env.TEST_EMAIL;
const type = process.argv[3] || process.env.TEST_TYPE || 'all';
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3033';

if (!email) {
  console.error('\n❌ Error: Email address is required\n');
  console.log('Usage:');
  console.log('  node test-email.js your@email.com [type]');
  console.log('  node test-email.js your@email.com contact');
  console.log('  node test-email.js your@email.com order');
  console.log('  node test-email.js your@email.com newsletter');
  console.log('  node test-email.js your@email.com all');
  console.log('\nOr set environment variables:');
  console.log('  TEST_EMAIL=your@email.com node test-email.js');
  console.log('  TEST_EMAIL=your@email.com TEST_TYPE=contact node test-email.js\n');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error(`\n❌ Error: Invalid email format: ${email}\n`);
  process.exit(1);
}

const validTypes = ['contact', 'order', 'newsletter', 'all'];
if (!validTypes.includes(type)) {
  console.error(`\n❌ Error: Invalid type: ${type}`);
  console.log(`Valid types: ${validTypes.join(', ')}\n`);
  process.exit(1);
}

async function testEmail() {
  console.log('\n📧 Testing Email Delivery...\n');
  console.log(`Email: ${email}`);
  console.log(`Type: ${type}`);
  console.log(`API URL: ${baseUrl}/api/email/test\n`);

  try {
    const url = `${baseUrl}/api/email/test?type=${type}&email=${encodeURIComponent(email)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok && response.status !== 207) {
      console.error('❌ Request failed:', data);
      process.exit(1);
    }

    // Display results
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 TEST RESULTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Configuration
    console.log('⚙️  Configuration:');
    console.log(`   RESEND_API_KEY: ${data.config?.resendApiKey || 'Unknown'}`);
    console.log(`   CONTACT_EMAIL: ${data.config?.contactEmail || 'Unknown'}`);
    console.log(`   SITE_URL: ${data.config?.siteUrl || 'Unknown'}\n`);

    // Summary
    console.log('📈 Summary:');
    console.log(`   Total Tests: ${data.summary?.total || 0}`);
    console.log(`   ✅ Passed: ${data.summary?.passed || 0}`);
    console.log(`   ❌ Failed: ${data.summary?.failed || 0}\n`);

    // Individual test results
    if (data.tests) {
      console.log('📋 Individual Test Results:\n');

      if (data.tests.contact !== undefined) {
        const test = data.tests.contact;
        const status = test.success ? '✅' : '❌';
        console.log(`   ${status} Contact Email:`);
        console.log(`      Success: ${test.success}`);
        if (test.error) {
          console.log(`      Error: ${test.error}`);
          if (test.details) {
            console.log(`      Details: ${test.details}`);
          }
          if (test.error.includes('Domain restriction')) {
            console.log(`      💡 Solution: Verify a domain in Resend or use your verified email for testing`);
          }
        }
        if (test.data?.id) {
          console.log(`      Email ID: ${test.data.id}`);
        }
        console.log('');
      }

      if (data.tests.order !== undefined) {
        const test = data.tests.order;
        const status = test.success ? '✅' : '❌';
        console.log(`   ${status} Order Confirmation Email:`);
        console.log(`      Success: ${test.success}`);
        if (test.error) {
          console.log(`      Error: ${test.error}`);
          if (test.details) {
            console.log(`      Details: ${test.details}`);
          }
          if (test.error.includes('Domain restriction')) {
            console.log(`      💡 Solution: Verify a domain in Resend or use your verified email for testing`);
          }
        }
        if (test.data?.id) {
          console.log(`      Email ID: ${test.data.id}`);
        }
        console.log('');
      }

      if (data.tests.newsletter !== undefined) {
        const test = data.tests.newsletter;
        const status = test.success ? '✅' : '❌';
        console.log(`   ${status} Newsletter Email:`);
        console.log(`      Success: ${test.success}`);
        if (test.error) {
          console.log(`      Error: ${test.error}`);
          if (test.details) {
            console.log(`      Details: ${test.details}`);
          }
          if (test.error.includes('Domain restriction')) {
            console.log(`      💡 Solution: Verify a domain in Resend or use your verified email for testing`);
          }
        }
        if (test.data?.id) {
          console.log(`      Email ID: ${test.data.id}`);
        }
        console.log('');
      }
    }

    // Final message
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (data.summary?.failed === 0) {
      console.log('✅ All tests passed! Check your inbox for the test emails.\n');
    } else {
      console.log(`⚠️  ${data.message || 'Some tests failed. Check the errors above.'}\n`);
    }

    // Exit with appropriate code
    process.exit(data.summary?.failed === 0 ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Error running email tests:', error.message);
    console.error('\nMake sure your Next.js development server is running:');
    console.error(`   npm run dev  (or yarn dev)`);
    console.error(`   Server should be running on: ${baseUrl}\n`);
    process.exit(1);
  }
}

// Run the test
testEmail();
