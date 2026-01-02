import { MainLayout } from 'src/layouts/main';

import { HomeHero } from '../home-hero';
import { HomeFeaturedBlogs } from '../home-featured-blogs';
import { HomeResourcesShowcase } from '../home-resources-showcase';
import { HomeCTA } from '../home-cta';

// ----------------------------------------------------------------------

export function HomeView() {
  return (
    <MainLayout>
      <HomeHero />
      <HomeFeaturedBlogs />
      <HomeResourcesShowcase />
      <HomeCTA />
    </MainLayout>
  );
}

