import Image from 'next/image';
import ConsentEmbed from '@/components/ConsentEmbed';
import { toHttpsUrl } from '@/lib/embeds';
import type { InstagramFeed } from '@/lib/instagram';

interface InstagramSectionProps {
  feed: InstagramFeed;
  heading?: string | null;
  followLabel?: string | null;
  profileUrl?: string;
}

export default function InstagramSection({ feed, heading, followLabel, profileUrl }: InstagramSectionProps) {
  if (feed.status === 'unconfigured') return null;
  const profile = toHttpsUrl(profileUrl);

  return (
    <section id="instagram" className="scroll-mt-20 border-t border-white/5 py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <h2 className="mb-12 text-center font-display text-4xl font-bold uppercase text-white">
          {heading?.trim() || 'From Instagram'}
        </h2>
        {feed.status === 'ready' && feed.posts.length > 0 ? (
          <ConsentEmbed provider="Instagram" description="These photos are hosted by Instagram (Meta).">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {feed.posts.map((post, index) => (
                <a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View Instagram post ${index + 1}`}
                  className="relative block aspect-square overflow-hidden rounded-sm bg-surface transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <Image
                    src={post.imageUrl}
                    alt={post.caption || `Instagram post ${index + 1}`}
                    fill
                    unoptimized
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="object-contain"
                  />
                </a>
              ))}
            </div>
          </ConsentEmbed>
        ) : (
          <p role="status" className="text-center text-muted">
            {feed.status === 'unavailable' ? 'Instagram photos are currently unavailable.' : 'No Instagram posts yet.'}
          </p>
        )}
        {profile && (
          <div className="mt-8 text-center">
            <a
              href={profile}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-sm border border-white/15 px-6 py-3 text-sm text-foreground transition-colors hover:border-accent hover:text-accent-text"
            >
              {followLabel?.trim() || 'Follow on Instagram'}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
