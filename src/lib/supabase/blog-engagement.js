// ============================================
// BLOG ENGAGEMENT ACTIONS
// Likes, Dislikes, Comments, and Replies
// ============================================

import { supabase } from './client';

// ============================================
// LIKES / DISLIKES
// ============================================

/**
 * Toggle like/dislike for a blog post
 * @param {string} blogId - The blog post ID
 * @param {boolean} isLike - true for like, false for dislike
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function toggleBlogLike(blogId, isLike) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'You must be signed in to like posts' };
    }

    // Check if user already liked/disliked this post
    const { data: existingLike, error: fetchError } = await supabase
      .from('blog_likes')
      .select('*')
      .eq('blog_id', blogId)
      .eq('user_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine
      return { success: false, error: fetchError.message };
    }

    if (existingLike) {
      // If clicking the same reaction, remove it
      if (existingLike.is_like === isLike) {
        const { error: deleteError } = await supabase
          .from('blog_likes')
          .delete()
          .eq('id', existingLike.id);

        if (deleteError) {
          return { success: false, error: deleteError.message };
        }

        return { success: true, data: { action: 'removed' } };
      }
      
      // If clicking opposite reaction, update it
      const { data, error: updateError } = await supabase
        .from('blog_likes')
        .update({ is_like: isLike })
        .eq('id', existingLike.id)
        .select()
        .single();

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return { success: true, data: { action: 'updated', ...data } };
    }

    // Create new like/dislike
    const { data, error: insertError } = await supabase
      .from('blog_likes')
      .insert([
        {
          blog_id: blogId,
          user_id: user.id,
          is_like: isLike,
        },
      ])
      .select()
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return { success: true, data: { action: 'created', ...data } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get like/dislike stats for a blog post
 * @param {string} blogId - The blog post ID
 * @returns {Promise<{likesCount: number, dislikesCount: number, userReaction?: 'like'|'dislike'|null}>}
 */
export async function getBlogLikeStats(blogId) {
  try {
    // Get all likes/dislikes for this blog
    const { data: likes, error } = await supabase
      .from('blog_likes')
      .select('*')
      .eq('blog_id', blogId);

    if (error) {
      console.error('Error fetching likes:', error);
      return { likesCount: 0, dislikesCount: 0, userReaction: null };
    }

    const likesCount = likes.filter((l) => l.is_like).length;
    const dislikesCount = likes.filter((l) => !l.is_like).length;

    // Check if current user has reacted
    const { data: { user } } = await supabase.auth.getUser();
    let userReaction = null;

    if (user) {
      const userLike = likes.find((l) => l.user_id === user.id);
      if (userLike) {
        userReaction = userLike.is_like ? 'like' : 'dislike';
      }
    }

    return { likesCount, dislikesCount, userReaction };
  } catch (error) {
    console.error('Error in getBlogLikeStats:', error);
    return { likesCount: 0, dislikesCount: 0, userReaction: null };
  }
}

// ============================================
// COMMENTS
// ============================================

/**
 * Get comments for a blog post (only approved comments for public view)
 * @param {string} blogId - The blog post ID
 * @param {boolean} includeAll - Include all comments (for admin view)
 * @returns {Promise<Array>}
 */
export async function getBlogComments(blogId, includeAll = false) {
  try {
    let query = supabase
      .from('blog_comments')
      .select('*')
      .eq('blog_id', blogId)
      .order('created_at', { ascending: false });

    if (!includeAll) {
      query = query.eq('status', 'approved');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    // Organize comments into threads (parent comments with their replies)
    const commentMap = {};
    const rootComments = [];

    data.forEach((comment) => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    data.forEach((comment) => {
      if (comment.parent_comment_id) {
        // This is a reply
        if (commentMap[comment.parent_comment_id]) {
          commentMap[comment.parent_comment_id].replies.push(commentMap[comment.id]);
        }
      } else {
        // This is a root comment
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  } catch (error) {
    console.error('Error in getBlogComments:', error);
    return [];
  }
}

/**
 * Add a comment to a blog post
 * @param {Object} commentData - Comment data
 * @param {string} commentData.blogId - The blog post ID
 * @param {string} commentData.content - Comment content
 * @param {string} commentData.authorName - Author name
 * @param {string} [commentData.authorEmail] - Author email (optional)
 * @param {string} [commentData.parentCommentId] - Parent comment ID for replies
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function addBlogComment({ blogId, content, authorName, authorEmail, parentCommentId }) {
  try {
    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    // Auto-approve all comments by default (can be moderated later from dashboard)
    const status = 'approved';

    const commentData = {
      blog_id: blogId,
      content,
      author_name: authorName,
      author_email: authorEmail || null,
      parent_comment_id: parentCommentId || null,
      user_id: user?.id || null,
      status,
    };

    const { data, error } = await supabase
      .from('blog_comments')
      .insert([commentData])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Update a comment
 * @param {string} commentId - The comment ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateBlogComment(commentId, updates) {
  try {
    const { data, error } = await supabase
      .from('blog_comments')
      .update(updates)
      .eq('id', commentId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a comment
 * @param {string} commentId - The comment ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteBlogComment(commentId) {
  try {
    const { error } = await supabase
      .from('blog_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Approve a comment (admin only)
 * @param {string} commentId - The comment ID
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function approveBlogComment(commentId) {
  return updateBlogComment(commentId, { status: 'approved' });
}

/**
 * Mark comment as spam (admin only)
 * @param {string} commentId - The comment ID
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function markCommentAsSpam(commentId) {
  return updateBlogComment(commentId, { status: 'spam' });
}

// ============================================
// ANALYTICS
// ============================================

/**
 * Get engagement analytics for all blogs
 * @returns {Promise<Object>}
 */
export async function getEngagementAnalytics() {
  try {
    // Get total likes and dislikes
    const { data: allLikes, error: likesError } = await supabase
      .from('blog_likes')
      .select('*');

    if (likesError) throw likesError;

    const totalLikes = allLikes.filter((l) => l.is_like).length;
    const totalDislikes = allLikes.filter((l) => !l.is_like).length;

    // Get total comments
    const { count: totalComments, error: commentsError } = await supabase
      .from('blog_comments')
      .select('*', { count: 'exact', head: true });

    if (commentsError) throw commentsError;

    // Get pending comments count
    const { count: pendingComments, error: pendingError } = await supabase
      .from('blog_comments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingError) throw pendingError;

    // Get top liked blogs
    const { data: blogsWithLikes, error: topBlogsError } = await supabase
      .from('blogs')
      .select(`
        id,
        title,
        slug
      `);

    if (topBlogsError) throw topBlogsError;

    // Calculate likes for each blog
    const blogsWithStats = await Promise.all(
      blogsWithLikes.map(async (blog) => {
        const stats = await getBlogLikeStats(blog.id);
        return {
          ...blog,
          ...stats,
          netLikes: stats.likesCount - stats.dislikesCount,
        };
      })
    );

    // Sort by net likes
    const topLikedBlogs = blogsWithStats
      .sort((a, b) => b.netLikes - a.netLikes)
      .slice(0, 5);

    // Get users with most likes (aggregate by user_id)
    const userLikeCounts = {};
    allLikes.forEach((like) => {
      if (like.is_like) {
        userLikeCounts[like.user_id] = (userLikeCounts[like.user_id] || 0) + 1;
      }
    });

    const topLikers = Object.entries(userLikeCounts)
      .map(([userId, count]) => ({ userId, likeCount: count }))
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 5);

    return {
      totalLikes,
      totalDislikes,
      totalComments,
      pendingComments,
      topLikedBlogs,
      topLikers,
    };
  } catch (error) {
    console.error('Error in getEngagementAnalytics:', error);
    return {
      totalLikes: 0,
      totalDislikes: 0,
      totalComments: 0,
      pendingComments: 0,
      topLikedBlogs: [],
      topLikers: [],
    };
  }
}

