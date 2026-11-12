import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'video',
  title: 'Gallery Video',
  type: 'document',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      description: 'Disabled videos are hidden from the website and sitemap.',
      initialValue: true,
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first.',
      initialValue: 10,
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      description: 'A youtube.com, youtu.be, shorts or live URL.',
      validation: (Rule) => Rule.required().uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      description: 'Uploaded thumbnail. The website does not request YouTube thumbnails.',
      options: { hotspot: true },
    }),
    defineField({ name: 'date', title: 'Date', type: 'date' }),
  ],
  orderings: [
    { title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'Date, newest', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'description', media: 'thumbnail', enabled: 'enabled' },
    prepare: ({ title, subtitle, media, enabled }) => ({
      title: title ?? 'Video',
      subtitle: [enabled === false ? 'Disabled' : null, subtitle].filter(Boolean).join(' · '),
      media,
    }),
  },
});
