/**
 * Each of the 5 profile steps contributes exactly 20 percentage points.
 *
 * Step 1 — Basic Info:        full_name AND location both filled
 * Step 2 — Skills:            at least 1 skill
 * Step 3 — Work Experience:   at least 1 structured entry
 * Step 4 — Education:         at least 1 structured entry
 * Step 5 — CV Upload:         cv_file_path is present
 */
export function calculateApplicantProfileCompletion(profile) {
  if (!profile) return 0;

  const steps = [
    Boolean(profile.full_name) && Boolean(profile.location),
    Array.isArray(profile.skills) ? profile.skills.length > 0 : Boolean(profile.skills),
    Array.isArray(profile.work_experience) ? profile.work_experience.length > 0 : false,
    Array.isArray(profile.education) ? profile.education.length > 0 : false,
    Boolean(profile.cv_file_path),
  ];

  return steps.filter(Boolean).length * 20;
}
