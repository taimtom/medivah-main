import { MainLayout } from 'src/layouts/main';

import { AboutHero } from '../about-hero';
import { AboutMission } from '../about-mission';
import { AboutCommunity } from '../about-community';

// ----------------------------------------------------------------------

export function AboutView() {
  return (
    <MainLayout>
      <AboutHero />
      <AboutMission />
      <AboutCommunity />
    </MainLayout>
  );
}

