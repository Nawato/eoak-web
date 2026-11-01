import { PortableText as BasePortableText } from '@portabletext/react';
import type { PortableTextComponents } from '@portabletext/react';
import type { PortableTextValue } from '@/sanity/types';

interface PortableTextProps {
  value?: PortableTextValue | null;
}

function isSafeHref(href: string | undefined): href is string {
  if (!href) return false;
  return /^(https?:|mailto:|tel:|\/|#)/i.test(href);
}

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="mt-10 mb-4 font-display text-3xl font-semibold uppercase text-white">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-3 font-display text-2xl font-semibold uppercase text-white">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-8 border-l-2 border-accent pl-6 font-display text-2xl italic text-zinc-300">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => <p className="mt-4 text-lg leading-relaxed text-zinc-300">{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-6 text-zinc-300">{children}</ul>,
    number: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-300">{children}</ol>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => {
      const href = typeof value?.href === 'string' ? value.href : undefined;
      if (!isSafeHref(href)) return <>{children}</>;
      const external = /^(https?:|\/\/|\/\\)/i.test(href);
      return (
        <a
          href={href}
          className="text-accent-text underline underline-offset-2 hover:text-rose-300"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      );
    },
  },
};

export default function PortableText({ value }: PortableTextProps) {
  if (!value || value.length === 0) return null;

  return (
    <div>
      <BasePortableText value={value} components={components} />
    </div>
  );
}
