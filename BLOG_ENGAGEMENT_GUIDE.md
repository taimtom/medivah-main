# Blog Engagement Features Guide

## Overview

The Mavidah HR website now includes comprehensive blog engagement features to increase user interaction and community participation. These features include:

- **Likes/Dislikes**: Users can react to blog posts
- **Comments**: Users can leave comments on blog posts
- **Comment Replies**: Users can reply to specific comments (threaded discussions)
- **Analytics Dashboard**: Track engagement metrics

---

## Features

### 1. **Like/Dislike System**

#### For Users (Public)
- Users can click the "👍 Like" or "👎 Dislike" button on any blog post
- Authenticated users can change their reaction or remove it by clicking again
- Guest users must sign in to like/dislike posts
- Like counts are displayed publicly

#### For Admins (Dashboard)
- View total likes and dislikes across all posts
- See top-liked blog posts
- Track net engagement (likes minus dislikes)

---

### 2. **Comments System**

#### For Users (Public)
- **Authenticated Users**: Comments are auto-approved
- **Guest Users**: Comments require approval before appearing publicly
- Users can reply to comments, creating threaded discussions
- Comments show author name and timestamp

#### For Admins (Dashboard)
- View total comments count
- See pending comments awaiting approval
- Moderate comments (approve, mark as spam, or delete)

---

## Database Schema

### Tables Created

#### 1. **`blog_likes`**
Stores user reactions to blog posts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `blog_id` | UUID | Reference to `blogs` table |
| `user_id` | UUID | Reference to `auth.users` table |
| `is_like` | BOOLEAN | `true` = like, `false` = dislike |
| `created_at` | TIMESTAMP | When reaction was added |
| `updated_at` | TIMESTAMP | When reaction was last changed |

**Constraints**:
- One reaction per user per blog (UNIQUE constraint on `blog_id`, `user_id`)
- Cascades on delete (if blog or user is deleted)

#### 2. **`blog_comments`**
Stores comments and replies on blog posts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `blog_id` | UUID | Reference to `blogs` table |
| `user_id` | UUID | Reference to `auth.users` (nullable for guest comments) |
| `author_name` | VARCHAR(255) | Display name of commenter |
| `author_email` | VARCHAR(255) | Email (optional, for guest commenters) |
| `content` | TEXT | Comment text |
| `parent_comment_id` | UUID | Reference to parent comment (for replies) |
| `status` | VARCHAR(50) | `pending`, `approved`, `spam`, or `deleted` |
| `created_at` | TIMESTAMP | When comment was posted |
| `updated_at` | TIMESTAMP | When comment was last edited |

**Constraints**:
- Self-referencing for replies (`parent_comment_id` references `blog_comments.id`)
- Cascades on delete (if blog or parent comment is deleted)

---

## Row Level Security (RLS) Policies

### Blog Likes Policies
- ✅ **Anyone** can view likes
- ✅ **Authenticated users** can add likes
- ✅ **Users** can update/delete their own likes only
- ❌ **Guests** cannot add likes (must sign in)

### Blog Comments Policies
- ✅ **Anyone** can view approved comments
- ✅ **Anyone** can add comments (authenticated or guest)
- ✅ **Users** can update/delete their own comments
- ✅ **Authenticated users (admins)** can view, update, or delete any comment

---

## Setup Instructions

### Step 1: Apply Database Schema

1. Open your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `SUPABASE_ENGAGEMENT_SCHEMA.sql`
4. Paste and click **Run**

This will create:
- `blog_likes` table
- `blog_comments` table
- RLS policies
- Helper functions for analytics
- Triggers for `updated_at` columns

### Step 2: Verify Tables

1. Go to **Table Editor** in Supabase
2. Confirm you see:
   - `blog_likes`
   - `blog_comments`
3. Check that RLS is enabled on both tables

### Step 3: Test the Features

#### Test Likes/Dislikes:
1. Visit a blog post as a signed-in user
2. Click the "Like" button
3. Verify the count increases
4. Click "Like" again to remove your reaction
5. Click "Dislike" and verify it switches

#### Test Comments:
1. Visit a blog post
2. Fill out the comment form (name required for guests)
3. Submit a comment
4. As an admin, check the dashboard for pending comments
5. Approve the comment and verify it appears on the blog post

#### Test Comment Replies:
1. On a blog post with comments, click "Reply" on a comment
2. Submit your reply
3. Verify the reply appears nested under the original comment

---

## Usage Examples

### For Developers

#### Toggle a Like/Dislike

```javascript
import { toggleBlogLike } from 'src/lib/supabase/blog-engagement';

// Like a blog post
const result = await toggleBlogLike(blogId, true);

// Dislike a blog post
const result = await toggleBlogLike(blogId, false);

if (result.success) {
  console.log('Reaction recorded:', result.data);
} else {
  console.error('Error:', result.error);
}
```

#### Get Like Statistics

```javascript
import { getBlogLikeStats } from 'src/lib/supabase/blog-engagement';

const stats = await getBlogLikeStats(blogId);
// Returns: { likesCount: 10, dislikesCount: 2, userReaction: 'like' | 'dislike' | null }
```

#### Add a Comment

```javascript
import { addBlogComment } from 'src/lib/supabase/blog-engagement';

const result = await addBlogComment({
  blogId: 'blog-uuid',
  content: 'Great article!',
  authorName: 'John Doe',
  authorEmail: 'john@example.com', // Optional
  parentCommentId: null, // or UUID for replies
});

if (result.success) {
  console.log('Comment added:', result.data);
}
```

#### Get Comments for a Blog

```javascript
import { getBlogComments } from 'src/lib/supabase/blog-engagement';

// Public view (approved comments only)
const comments = await getBlogComments(blogId);

// Admin view (all comments)
const allComments = await getBlogComments(blogId, true);
```

#### Get Engagement Analytics

```javascript
import { getEngagementAnalytics } from 'src/lib/supabase/blog-engagement';

const analytics = await getEngagementAnalytics();
// Returns:
// {
//   totalLikes: 150,
//   totalDislikes: 20,
//   totalComments: 85,
//   pendingComments: 5,
//   topLikedBlogs: [...],
//   topLikers: [...]
// }
```

---

## Analytics Dashboard Metrics

The analytics dashboard (`/dashboard/analytics`) now displays:

### Engagement Summary Widgets
1. **Total Likes**: Count of all likes across all blog posts
2. **Total Dislikes**: Count of all dislikes
3. **Total Comments**: All comments (with pending count)
4. **Net Engagement**: Likes minus dislikes

### Top Liked Blogs Card
- Shows top 5 most-liked blog posts
- Displays like/dislike counts
- Shows net engagement score

### Recent Activity
- Includes latest comments, blogs, products, and jobs
- Sortable by date

---

## Comment Moderation

### As an Admin

#### Approve Comments
```javascript
import { approveBlogComment } from 'src/lib/supabase/blog-engagement';

await approveBlogComment(commentId);
```

#### Mark as Spam
```javascript
import { markCommentAsSpam } from 'src/lib/supabase/blog-engagement';

await markCommentAsSpam(commentId);
```

#### Delete Comment
```javascript
import { deleteBlogComment } from 'src/lib/supabase/blog-engagement';

await deleteBlogComment(commentId);
```

---

## Best Practices

### For Users
1. **Be Respectful**: Keep comments constructive and professional
2. **Stay On Topic**: Comment on the blog post content
3. **Use Real Names**: Builds trust in the community

### For Admins
1. **Moderate Regularly**: Check pending comments daily
2. **Respond to Comments**: Engage with your audience
3. **Remove Spam**: Keep the comment section clean
4. **Monitor Analytics**: Track what content resonates with users

---

## Troubleshooting

### Likes Not Working
**Problem**: Users can't like posts
**Solution**:
- Ensure users are signed in
- Check RLS policies in Supabase
- Verify `blog_likes` table exists

### Comments Not Appearing
**Problem**: Comments don't show up after submission
**Solution**:
- Guest comments require approval - check dashboard
- Authenticated user comments should appear immediately
- Verify RLS policies allow `status = 'approved'` to be viewed

### Analytics Not Loading
**Problem**: Engagement metrics show 0
**Solution**:
- Ensure Supabase environment variables are set
- Check database has data in `blog_likes` and `blog_comments` tables
- Verify helper functions were created via SQL script

---

## Future Enhancements

Potential features to add:

1. **Comment Reactions**: Allow users to like/dislike comments
2. **Email Notifications**: Notify users when someone replies to their comment
3. **Comment Sorting**: Sort by newest, oldest, or most liked
4. **User Profiles**: Link comments to user profile pages
5. **Report Abuse**: Allow users to flag inappropriate comments
6. **Comment Search**: Search through comments
7. **Rich Text Comments**: Allow formatting in comments
8. **Comment Edit History**: Track when comments are edited

---

## API Reference

All engagement functions are exported from:
```javascript
import {
  toggleBlogLike,
  getBlogLikeStats,
  getBlogComments,
  addBlogComment,
  updateBlogComment,
  deleteBlogComment,
  approveBlogComment,
  markCommentAsSpam,
  getEngagementAnalytics,
} from 'src/lib/supabase/blog-engagement';
```

See `src/lib/supabase/blog-engagement.js` for full API documentation.

---

## Security Considerations

1. **RLS is Enabled**: All tables use Row Level Security
2. **Authenticated Actions**: Only signed-in users can modify their own data
3. **Admin Controls**: Admins can moderate all content
4. **Input Sanitization**: Always sanitize user input on the frontend
5. **Rate Limiting**: Consider implementing rate limits for comment submissions

---

## Support

For issues or questions:
- Check Supabase logs in the Dashboard
- Review browser console for errors
- Verify environment variables are set correctly
- Ensure database schema is up to date

---

**Last Updated**: December 29, 2025
**Version**: 1.0.0

