export interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: '/#music', label: 'Music' },
  { href: '/#releases', label: 'Releases' },
  { href: '/#shows', label: 'Shows' },
  { href: '/#bio', label: 'Bio' },
  { href: '/#band', label: 'Band' },
  { href: '/#contact', label: 'Contact' },
];

export function getNavLinks({ hasReleases, hasMembers }: { hasReleases: boolean; hasMembers: boolean }): NavLink[] {
  return navLinks.filter((link) =>
    (link.href !== '/#releases' || hasReleases) &&
    (link.href !== '/#band' || hasMembers),
  );
}
