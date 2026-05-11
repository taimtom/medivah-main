-- ============================================================
-- ANALYTICS RPC MIGRATION
-- Replaces 17+ individual queries with a single Postgres function.
-- Run once in the Supabase SQL Editor.
-- ============================================================

CREATE OR REPLACE FUNCTION get_dashboard_analytics(p_role TEXT, p_member_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
AS $$
DECLARE
  -- NULL for admin (sees all data), otherwise scoped to the calling member.
  v_scope UUID;

  v_stats  JSONB;
  v_recent JSONB;
  v_engage JSONB;

  -- stats
  v_total_blogs              BIGINT;
  v_published_blogs          BIGINT;
  v_total_products           BIGINT;
  v_published_products       BIGINT;
  v_total_jobs               BIGINT;
  v_active_jobs              BIGINT;
  v_total_orders             BIGINT;
  v_total_revenue            NUMERIC;
  v_credits_purchased        NUMERIC;
  v_credits_used             NUMERIC;
  v_net_earnings             NUMERIC;
  v_applications_submitted   BIGINT;
  v_unique_applicants        BIGINT;
  v_profile_completion_rate  NUMERIC;
  v_apps_per_applicant       NUMERIC;
  v_conversion_rate          NUMERIC;

  -- engagement
  v_total_likes     BIGINT;
  v_total_dislikes  BIGINT;
  v_total_comments  BIGINT;
  v_pending_comments BIGINT;
  v_top_liked_blogs JSONB;
BEGIN
  v_scope := CASE WHEN p_role = 'admin' THEN NULL ELSE p_member_id END;

  -- ============================================================
  -- APPLICANT PATH
  -- Uses: idx_job_applications_applicant_id, idx_saved_jobs_applicant_id,
  --       idx_applicant_profiles_user_id
  -- ============================================================
  IF p_role = 'applicant' THEN
    RETURN jsonb_build_object(
      'stats', jsonb_build_object(
        'totalBlogs',              0,
        'publishedBlogs',          0,
        'totalProducts',           0,
        'publishedProducts',       0,
        'totalJobs',               0,
        'activeJobs',              0,
        'totalOrders',             0,
        'totalRevenue',            0,
        'creditsPurchased',        0,
        'creditsUsed',             0,
        'netEarnings',             0,
        'applicationsSubmitted',
          (SELECT COUNT(*) FROM job_applications WHERE applicant_id = p_member_id),
        'savedJobs',
          (SELECT COUNT(*) FROM saved_jobs WHERE applicant_id = p_member_id),
        'profileCompletionRate',
          COALESCE(
            (SELECT profile_completion FROM applicant_profiles WHERE user_id = p_member_id),
            0
          ),
        'applicationsPerApplicant',  0,
        'applicationConversionRate', 0,
        'applicationStatusBreakdown',
          COALESCE(
            (SELECT jsonb_object_agg(status, cnt)
             FROM (
               SELECT status, COUNT(*) AS cnt
               FROM job_applications
               WHERE applicant_id = p_member_id
               GROUP BY status
             ) s),
            '{}'::jsonb
          )
      ),
      'recentActivity', '[]'::jsonb,
      'engagement', jsonb_build_object(
        'totalLikes',     0,
        'totalDislikes',  0,
        'totalComments',  0,
        'pendingComments', 0,
        'topLikedBlogs',  '[]'::jsonb,
        'topLikers',      '[]'::jsonb
      )
    );
  END IF;

  -- ============================================================
  -- MEMBER / RECRUITER / ADMIN PATH
  -- ============================================================

  -- Content counts (uses idx_blogs_member_id, idx_jobs_member_id, idx_products_member_id)
  SELECT
    COUNT(*) FILTER (WHERE v_scope IS NULL OR b.member_id = v_scope),
    COUNT(*) FILTER (WHERE (v_scope IS NULL OR b.member_id = v_scope) AND b.published)
  INTO v_total_blogs, v_published_blogs
  FROM blogs b;

  SELECT
    COUNT(*) FILTER (WHERE v_scope IS NULL OR p.member_id = v_scope),
    COUNT(*) FILTER (WHERE (v_scope IS NULL OR p.member_id = v_scope) AND p.published)
  INTO v_total_products, v_published_products
  FROM products p;

  SELECT
    COUNT(*) FILTER (WHERE v_scope IS NULL OR j.member_id = v_scope),
    COUNT(*) FILTER (WHERE (v_scope IS NULL OR j.member_id = v_scope) AND j.published)
  INTO v_total_jobs, v_active_jobs
  FROM jobs j;

  -- Orders (uses idx_orders_resource_member_id, idx_orders_status)
  SELECT
    COUNT(*),
    COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0)
  INTO v_total_orders, v_total_revenue
  FROM orders
  WHERE v_scope IS NULL OR resource_member_id = v_scope;

  -- Credits (uses idx_wallet_transactions_member_id, idx_wallet_transactions_reason_code)
  SELECT
    COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'credit'), 0),
    COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'debit'),  0)
  INTO v_credits_purchased, v_credits_used
  FROM wallet_transactions
  WHERE reason_code IN ('credit_purchase', 'job_publish')
    AND (v_scope IS NULL OR member_id = v_scope);

  -- Earnings (uses idx_member_earnings_member_id)
  SELECT COALESCE(SUM(amount), 0)
  INTO v_net_earnings
  FROM member_earnings_ledger
  WHERE v_scope IS NULL OR member_id = v_scope;

  -- Applications received as employer (uses idx_job_applications_employer_member_id)
  SELECT
    COUNT(*),
    COUNT(DISTINCT applicant_id)
  INTO v_applications_submitted, v_unique_applicants
  FROM job_applications
  WHERE v_scope IS NULL OR employer_member_id = v_scope;

  -- Profile completion rate — only meaningful for admin
  IF p_role = 'admin' THEN
    SELECT COALESCE(ROUND(AVG(profile_completion)), 0)
    INTO v_profile_completion_rate
    FROM applicant_profiles;
  ELSE
    v_profile_completion_rate := 0;
  END IF;

  -- Derived rates
  v_apps_per_applicant := CASE
    WHEN v_unique_applicants > 0
    THEN ROUND((v_applications_submitted::NUMERIC / v_unique_applicants), 2)
    ELSE 0
  END;

  v_conversion_rate := CASE
    WHEN v_active_jobs > 0
    THEN ROUND(((v_applications_submitted::NUMERIC / v_active_jobs) * 100), 2)
    ELSE 0
  END;

  -- Build stats JSON
  v_stats := jsonb_build_object(
    'totalBlogs',               v_total_blogs,
    'publishedBlogs',           v_published_blogs,
    'totalProducts',            v_total_products,
    'publishedProducts',        v_published_products,
    'totalJobs',                v_total_jobs,
    'activeJobs',               v_active_jobs,
    'totalOrders',              v_total_orders,
    'totalRevenue',             v_total_revenue,
    'creditsPurchased',         v_credits_purchased,
    'creditsUsed',              v_credits_used,
    'netEarnings',              v_net_earnings,
    'applicationsSubmitted',    v_applications_submitted,
    'profileCompletionRate',    v_profile_completion_rate,
    'applicationsPerApplicant', v_apps_per_applicant,
    'applicationConversionRate', v_conversion_rate
  );

  -- ============================================================
  -- RECENT ACTIVITY
  -- Top 5 most recent items across blogs, products, and jobs.
  -- ============================================================
  SELECT jsonb_agg(item ORDER BY (item->>'created_at') DESC)
  INTO v_recent
  FROM (
    (
      SELECT jsonb_build_object(
        'id', b.id, 'title', b.title, 'type', 'blog', 'created_at', b.created_at
      ) AS item
      FROM blogs b
      WHERE v_scope IS NULL OR b.member_id = v_scope
      ORDER BY b.created_at DESC
      LIMIT 3
    )
    UNION ALL
    (
      SELECT jsonb_build_object(
        'id', p.id, 'title', p.name, 'name', p.name, 'type', 'product', 'created_at', p.created_at
      ) AS item
      FROM products p
      WHERE v_scope IS NULL OR p.member_id = v_scope
      ORDER BY p.created_at DESC
      LIMIT 3
    )
    UNION ALL
    (
      SELECT jsonb_build_object(
        'id', j.id, 'title', j.title, 'type', 'job', 'created_at', j.created_at
      ) AS item
      FROM jobs j
      WHERE v_scope IS NULL OR j.member_id = v_scope
      ORDER BY j.created_at DESC
      LIMIT 3
    )
  ) sub
  LIMIT 5;

  v_recent := COALESCE(v_recent, '[]'::jsonb);

  -- ============================================================
  -- ENGAGEMENT
  -- Single JOIN replaces the two-step blogs→IDs→likes pattern.
  -- Uses: idx_blog_likes_blog_id, idx_blogs_member_id,
  --       idx_blog_comments_blog_id, idx_blog_comments_status
  -- ============================================================

  SELECT
    COALESCE(COUNT(*) FILTER (WHERE bl.is_like),      0),
    COALESCE(COUNT(*) FILTER (WHERE NOT bl.is_like),  0)
  INTO v_total_likes, v_total_dislikes
  FROM blog_likes bl
  JOIN blogs b ON b.id = bl.blog_id
  WHERE v_scope IS NULL OR b.member_id = v_scope;

  SELECT
    COALESCE(COUNT(*),                                   0),
    COALESCE(COUNT(*) FILTER (WHERE bc.status = 'pending'), 0)
  INTO v_total_comments, v_pending_comments
  FROM blog_comments bc
  JOIN blogs b ON b.id = bc.blog_id
  WHERE v_scope IS NULL OR b.member_id = v_scope;

  -- Top liked blogs — aggregated entirely in SQL, no second lookup needed
  SELECT COALESCE(jsonb_agg(row ORDER BY net_likes DESC), '[]'::jsonb)
  INTO v_top_liked_blogs
  FROM (
    SELECT
      b.id,
      b.title,
      b.slug,
      COUNT(*) FILTER (WHERE bl.is_like)     AS likes_count,
      COUNT(*) FILTER (WHERE NOT bl.is_like) AS dislikes_count,
      COUNT(*) FILTER (WHERE bl.is_like) - COUNT(*) FILTER (WHERE NOT bl.is_like) AS net_likes,
      jsonb_build_object(
        'id',           b.id,
        'title',        b.title,
        'slug',         b.slug,
        'likesCount',   COUNT(*) FILTER (WHERE bl.is_like),
        'dislikesCount',COUNT(*) FILTER (WHERE NOT bl.is_like),
        'netLikes',     COUNT(*) FILTER (WHERE bl.is_like) - COUNT(*) FILTER (WHERE NOT bl.is_like)
      ) AS row
    FROM blog_likes bl
    JOIN blogs b ON b.id = bl.blog_id
    WHERE v_scope IS NULL OR b.member_id = v_scope
    GROUP BY b.id, b.title, b.slug
    ORDER BY net_likes DESC
    LIMIT 5
  ) top_blogs;

  v_engage := jsonb_build_object(
    'totalLikes',     v_total_likes,
    'totalDislikes',  v_total_dislikes,
    'totalComments',  v_total_comments,
    'pendingComments', v_pending_comments,
    'topLikedBlogs',  v_top_liked_blogs,
    'topLikers',      '[]'::jsonb
  );

  -- ============================================================
  -- FINAL RESULT
  -- ============================================================
  RETURN jsonb_build_object(
    'stats',         v_stats,
    'recentActivity', v_recent,
    'engagement',    v_engage
  );
END;
$$;

-- Grant execute to authenticated and service_role
GRANT EXECUTE ON FUNCTION get_dashboard_analytics(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_analytics(TEXT, UUID) TO service_role;
