import { CONFIG } from 'src/config-global';

import { createServerClient } from 'src/lib/supabase/server';

import { JobDetailView } from 'src/sections/jobs/job-detail-view';

// ----------------------------------------------------------------------

export async function generateMetadata({ params }) {
  const { id } = params;
  
  try {
    const supabase = createServerClient();
    const { data: job } = await supabase
      .from('jobs')
      .select('title, company, location, description')
      .eq('id', id)
      .eq('published', true)
      .single();

    if (!job) {
      return {
        title: `Job Details - ${CONFIG.site.name}`,
        description: 'Find the best HR and career opportunities at Mavidah.',
      };
    }

    const title = `${job.title}${job.company ? ` at ${job.company}` : ''} | ${CONFIG.site.name}`;
    const description = job.description 
      ? `${job.description.substring(0, 155)}...` 
      : `Apply for ${job.title}${job.location ? ` in ${job.location}` : ''} at ${CONFIG.site.name}.`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || CONFIG.site.serverUrl || 'https://www.mavidah.com';
    const image = `${siteUrl}/logo/og-image.jpeg`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${siteUrl}/jobs/${id}`,
        siteName: CONFIG.site.name,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: job.title,
          },
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: `Job Details - ${CONFIG.site.name}`,
      description: 'Find the best HR and career opportunities at Mavidah.',
    };
  }
}

export default function Page({ params }) {
  return <JobDetailView jobId={params.id} />;
}
