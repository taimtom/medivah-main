import { ApplicantDetailView } from 'src/sections/dashboard/applications/applicant-detail-view';

export const metadata = { title: 'Applicant Profile | Dashboard' };

export default function Page({ params }) {
  return <ApplicantDetailView userId={params.userId} />;
}
