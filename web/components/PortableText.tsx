import type { ReactNode } from 'react';
import type { PortableTextBlock, PortableTextSpan, PortableTextValue } from '@/sanity/types';

interface PortableTextProps {
  value?: PortableTextValue | null;
}

function renderInline(children: PortableTextSpan[] | undefined, keyPrefix: string): ReactNode {
  return (children ?? []).map((child, i) => (
    <span key={child._key ?? `${keyPrefix}-child-${i}`}>{child.text}</span>
  ));
}

function renderBlock(block: PortableTextBlock, key: string) {
  switch (block.style) {
    case 'h2':
      return (
        <h2 key={key} className="mt-10 mb-4 font-display text-3xl font-semibold uppercase text-white">
          {renderInline(block.children, key)}
        </h2>
      );
    case 'h3':
      return (
        <h3 key={key} className="mt-8 mb-3 font-display text-2xl font-semibold uppercase text-white">
          {renderInline(block.children, key)}
        </h3>
      );
    case 'blockquote':
      return (
        <blockquote
          key={key}
          className="mt-8 border-l-2 border-accent pl-6 font-display text-2xl italic text-zinc-300"
        >
          {renderInline(block.children, key)}
        </blockquote>
      );
    default:
      return (
        <p key={key} className="mt-4 text-lg leading-relaxed text-zinc-300">
          {renderInline(block.children, key)}
        </p>
      );
  }
}

export default function PortableText({ value }: PortableTextProps) {
  const blocks = value ?? [];

  if (blocks.length === 0) {
    return null;
  }

  const nodes: ReactNode[] = [];
  let listItems: PortableTextBlock[] = [];
  let listType: 'bullet' | 'number' = 'bullet';

  function flushList() {
    if (listItems.length === 0) return;

    const ListTag = listType === 'number' ? 'ol' : 'ul';
    const items = listItems;
    listItems = [];

    nodes.push(
      <ListTag
        key={`list-${nodes.length}`}
        className={
          listType === 'number'
            ? 'mt-4 list-decimal space-y-2 pl-6 text-zinc-300'
            : 'mt-4 list-disc space-y-2 pl-6 text-zinc-300'
        }
      >
        {items.map((item, i) => (
          <li key={item._key ?? `list-item-${i}`}>{renderInline(item.children, `list-item-${i}`)}</li>
        ))}
      </ListTag>
    );
  }

  blocks.forEach((block, index) => {
    if (block.listItem) {
      const type = block.listItem === 'number' ? 'number' : 'bullet';
      if (listItems.length > 0 && type !== listType) flushList();
      listType = type;
      listItems.push(block);
      return;
    }

    flushList();
    nodes.push(renderBlock(block, block._key ?? `block-${index}`));
  });

  flushList();

  return <div>{nodes}</div>;
}
