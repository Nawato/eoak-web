import Image from 'next/image';
import SocialIcon from '@/components/SocialIcon';
import { toHttpsUrl } from '@/lib/embeds';
import { getImageUrl, getObjectPosition, hasImage } from '@/lib/sanity-image';
import type { Member } from '@/lib/sanity';
import { socialPlatforms } from '@/sanity/types';

export default function MembersSection({ members }: { members: Member[] }) {
  if (members.length === 0) return null;

  return (
    <section id="band" className="scroll-mt-20 border-t border-white/5 bg-black/40 py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <h2 className="mb-12 text-center font-display text-4xl font-bold uppercase text-white">The Band</h2>
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member) => {
            const photoUrl = hasImage(member.photo) ? getImageUrl(member.photo, 600, 750) : undefined;
            const socialLinks = (member.socialLinks ?? []).flatMap((link) => {
              const href = toHttpsUrl(link.url);
              const platform = socialPlatforms.find((entry) => entry.value === link.platform);
              return href && platform ? [{ ...link, href, platform }] : [];
            });
            return (
              <li key={member._id} className="text-center">
                <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-sm border border-white/10 bg-surface">
                  {photoUrl && (
                    <Image
                      src={photoUrl}
                      alt={member.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                      style={{ objectPosition: getObjectPosition(member.photo) }}
                    />
                  )}
                </div>
                <p className="font-display text-xl font-semibold uppercase text-white">{member.name}</p>
                {(member.instrument || member.role) && (
                  <p className="text-xs uppercase tracking-widest text-accent-text">
                    {[member.instrument, member.role].filter(Boolean).join(' · ')}
                  </p>
                )}
                {member.yearsActive && <p className="mt-1 text-xs text-muted">{member.yearsActive}</p>}
                {member.bio && <p className="mt-3 text-sm text-zinc-400">{member.bio}</p>}
                {socialLinks.length > 0 && (
                  <ul className="mt-3 flex justify-center gap-3">
                    {socialLinks.map((link, index) => (
                      <li key={`${link.platform.value}-${index}`}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} on ${link.platform.label}`}
                          className="text-muted transition-colors hover:text-accent-text"
                        >
                          <SocialIcon platform={link.platform.value} className="h-4 w-4" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
