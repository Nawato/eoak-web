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
  { href: '/#instagram', label: 'From Instagram' },
  { href: '/#contact', label: 'Contact' },
];

export function getNavLinks({
  hasReleases,
  hasMembers,
  hasInstagram = false,
  instagramHeading,
}: {
  hasReleases: boolean;
  hasMembers: boolean;
  hasInstagram?: boolean;
  instagramHeading?: string | null;
}): NavLink[] {
  return navLinks
    .filter(
      (link) =>
        (link.href !== '/#releases' || hasReleases) &&
        (link.href !== '/#band' || hasMembers) &&
        (link.href !== '/#instagram' || hasInstagram),
    )
    .map((link) => (link.href === '/#instagram' ? { ...link, label: instagramHeading?.trim() || link.label } : link));
}
