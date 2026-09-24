export type PublishableProject = {
  authorizationGranted: boolean;
  team: readonly { authorizationGranted: boolean }[];
  testimonials: readonly { authorizationGranted: boolean }[];
};

export function projectPublicationIssues(project: PublishableProject) {
  const issues: string[] = [];
  if (!project.authorizationGranted) issues.push("El caso no tiene autorización de publicación.");
  if (project.team.some((member) => !member.authorizationGranted)) {
    issues.push("Hay integrantes del equipo sin autorización.");
  }
  if (project.testimonials.some((item) => !item.authorizationGranted)) {
    issues.push("Hay testimonios sin autorización.");
  }
  return issues;
}
