import Image from 'next/image';
import { getImageUrl, getObjectPosition, hasImage } from '@/lib/sanity-image';
import type { Member } from '@/lib/sanity';

export default function MembersSection({ members }: { members: Member[] }) {
  if (members.length === 0) return null;

  return (
    <section id="band" className="scroll-mt-20 border-t border-white/5 bg-black/40 py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <h2 className="mb-12 text-center font-display text-4xl font-bold uppercase text-white">The Band</h2>
        <ul className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {members.map((member) => {
            const photoUrl = hasImage(member.photo) ? getImageUrl(member.photo, 600, 750) : undefined;
            return (
              <li key={member._id} className="text-center">
                <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-sm border border-white/10 bg-surface">
                  {photoUrl && (
                    <Image
                      src={photoUrl}
                      alt={member.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                      style={{ objectPosition: getObjectPosition(member.photo) }}
                    />
                  )}
                </div>
                <p className="font-display text-xl font-semibold uppercase text-white">{member.name}</p>
                {member.role && <p className="text-xs uppercase tracking-widest text-accent">{member.role}</p>}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
