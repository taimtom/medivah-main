# Newsletter System Enhancements

This document describes the advanced features added to the newsletter system.

## Features Implemented

### 1. Email Scheduling ✅
- **Database**: `scheduled_at` field in newsletters table
- **UI**: DateTime picker in newsletter form
- **API**: `/api/newsletter/schedule` endpoint for cron jobs
- **Cron Setup**: Configured in `vercel.json` (runs every 5 minutes)

**Usage:**
- Set a date/time in the newsletter form to schedule automatic sending
- The cron job checks for scheduled newsletters and sends them automatically
- For Vercel deployment, cron runs automatically
- For other deployments, set up a cron job to hit `/api/newsletter/schedule`

### 2. Click Tracking ✅
- **Database**: `newsletter_links` and `newsletter_link_clicks` tables
- **Automatic**: All links in newsletter content are automatically converted to tracking URLs
- **API**: `/api/newsletter/track/click?link={linkId}`
- **Features**:
  - Tracks total clicks and unique clicks per link
  - Records click timestamp, IP address, and user agent
  - Updates newsletter click counts automatically

**How it works:**
- Links in HTML content are automatically replaced with tracking URLs before sending
- Tracking URLs redirect to original URLs while recording the click
- Analytics dashboard shows top clicked links

### 3. A/B Testing ✅
- **Database**: `newsletter_variants` table
- **API**: `/api/newsletter/variants` (GET, POST, PUT, DELETE)
- **Types**: Subject line testing and content testing
- **Features**:
  - Create multiple variants per newsletter
  - Track performance metrics per variant
  - Declare winner based on performance

**Usage:**
1. Create a newsletter
2. Add variants via API (subject or content variants)
3. Send newsletter with variant selection
4. Compare performance metrics

**API Example:**
```javascript
// Create subject variant
POST /api/newsletter/variants
{
  "newsletter_id": "...",
  "variant_type": "subject",
  "variant_name": "Variant A",
  "subject": "Different Subject Line"
}

// Send with variant
POST /api/newsletter/send
{
  "newsletter_id": "...",
  "variant_id": "..."
}
```

### 4. Segmentation by Subscriber Source ✅
- **Database**: Subscriber source already tracked in `newsletter_subscribers.source`
- **UI**: Dropdown in send dialog to filter by source
- **API**: `source_filter` parameter in `/api/newsletter/send`

**Segments:**
- `all` - All subscribers
- `manual` - Manual signups
- `purchase` - Customers who purchased products
- `signup` - Form signups

### 5. Email Analytics Dashboard ✅
- **Page**: `/dashboard/newsletter/analytics?id={newsletter_id}`
- **API**: `/api/newsletter/analytics?newsletter_id={id}`
- **Metrics Displayed**:
  - Total sent, opened, clicked
  - Open rate, click rate, click-to-open rate
  - Top clicked links with click counts
  - Opens over time (per day)

**Access:**
- Click "View Analytics" from newsletter list for sent newsletters
- Shows comprehensive engagement metrics
- Visual progress bars for rates

## Database Setup

Run these SQL files in order:
1. `create_newsletter_tables.sql` (base tables)
2. `newsletter_enhancements_schema.sql` (enhancements)
3. `newsletter_sql_helpers.sql` (helper functions)

## Cron Job Setup

### Vercel (Automatic)
The `vercel.json` file is already configured. Cron runs automatically on Vercel.

### Manual Setup (Other Platforms)
Set up a cron job to call:
```
GET /api/newsletter/schedule
Authorization: Bearer {CRON_SECRET}
```

**Recommended Schedule:** Every 5 minutes

**Environment Variable:**
Add to `.env.local`:
```
CRON_SECRET=your-secret-key-here
```

## API Endpoints

### Tracking
- `GET /api/newsletter/track/open?email={email}&send={sendId}` - Open tracking pixel
- `GET /api/newsletter/track/click?link={linkId}&email={email}&send={sendId}` - Click tracking redirect

### Scheduling
- `GET /api/newsletter/schedule` - Check and send scheduled newsletters (cron endpoint)

### Analytics
- `GET /api/newsletter/analytics?newsletter_id={id}` - Get analytics data

### Variants (A/B Testing)
- `GET /api/newsletter/variants?newsletter_id={id}` - Get variants
- `POST /api/newsletter/variants` - Create variant
- `PUT /api/newsletter/variants` - Update variant
- `DELETE /api/newsletter/variants?id={id}` - Delete variant

### Send with Options
- `POST /api/newsletter/send` - Send newsletter
  ```json
  {
    "newsletter_id": "...",
    "test_email": "test@example.com", // Optional: for test emails
    "source_filter": "all", // Optional: "all", "manual", "purchase", "signup"
    "variant_id": "..." // Optional: for A/B testing
  }
  ```

## Usage Examples

### Schedule a Newsletter
1. Create/edit newsletter
2. Set "Schedule Send" date/time
3. Save - newsletter status becomes "scheduled"
4. Cron job will automatically send at scheduled time

### Send to Specific Segment
1. Open newsletter in dashboard
2. Click "Send to All"
3. Select segment (e.g., "Purchase Subscribers")
4. Confirm send

### View Analytics
1. Go to newsletter list
2. Find sent newsletter
3. Click menu → "View Analytics"
4. See detailed metrics and top links

### Track Clicks
- Automatic! All links in newsletter content are tracked
- No additional setup required
- View click data in analytics dashboard

## Future Enhancements (Optional)

- Automated A/B test winner selection
- Email templates library
- Subscriber tags and custom segments
- Email preview in different clients
- Advanced time-based analytics charts
- Email heatmaps
- Subscriber engagement scoring

