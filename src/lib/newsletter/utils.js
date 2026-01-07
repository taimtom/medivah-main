/**
 * Newsletter utility functions
 */

/**
 * Replace all links in HTML with tracking URLs
 */
export async function replaceLinksWithTracking(html, newsletterId, supabase) {
  if (!html || !newsletterId) return html;

  // Regex to find all <a href="..."> tags
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>/gi;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3030';
  let processedHtml = html;
  const linkPromises = [];

  // Find all links
  const links = [];
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const originalUrl = match[1];
    // Skip mailto:, tel:, and internal links that shouldn't be tracked
    if (
      originalUrl.startsWith('mailto:') ||
      originalUrl.startsWith('tel:') ||
      originalUrl.startsWith('#') ||
      originalUrl.startsWith('javascript:')
    ) {
      continue;
    }
    links.push({ original: originalUrl, fullMatch: match[0] });
  }

  // Process each link
  for (const link of links) {
    const promise = (async () => {
      // Check if link already exists
      const { data: existingLink } = await supabase
        .from('newsletter_links')
        .select('id, tracking_url')
        .eq('newsletter_id', newsletterId)
        .eq('original_url', link.original)
        .single();

      let trackingUrl;
      let linkId;

      if (existingLink) {
        linkId = existingLink.id;
        trackingUrl = existingLink.tracking_url;
      } else {
        // Insert new link first
        const { data: newLink, error } = await supabase
          .from('newsletter_links')
          .insert([
            {
              newsletter_id: newsletterId,
              original_url: link.original,
              tracking_url: '', // Will update after getting ID
            },
          ])
          .select()
          .single();

        if (error) {
          console.error('Error creating tracking link:', error);
          return null;
        }

        linkId = newLink.id;

        // Create tracking URL with actual link ID
        const finalTrackingUrl = `${baseUrl}/api/newsletter/track/click?link=${linkId}`;
        
        // Update tracking URL
        await supabase
          .from('newsletter_links')
          .update({ tracking_url: finalTrackingUrl })
          .eq('id', linkId);
        
        trackingUrl = finalTrackingUrl;
      }

      // Replace the href in the HTML
      const updatedLink = link.fullMatch.replace(
        /href=["'][^"']+["']/i,
        `href="${trackingUrl}"`
      );

      return {
        original: link.fullMatch,
        updated: updatedLink,
      };
    })();

    linkPromises.push(promise);
  }

  // Wait for all links to be processed
  const results = await Promise.all(linkPromises);

  // Replace all links in the HTML
  results.forEach((result) => {
    if (result) {
      processedHtml = processedHtml.replace(result.original, result.updated);
    }
  });

  return processedHtml;
}

/**
 * Create tracking pixel URL
 */
export function createTrackingPixel(sendId, email) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3030';
  return `${baseUrl}/api/newsletter/track/open?email=${encodeURIComponent(email)}&send=${sendId}`;
}

