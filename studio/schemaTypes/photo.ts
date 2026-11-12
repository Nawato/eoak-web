import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'photo',
  title: 'Gallery Photo',
  type: 'document',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      description: 'Disabled photos are hidden from the website and sitemap.',
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
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Alternative Text',
      type: 'string',
      description: 'Describe the photo for screen readers. Required for accessibility.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'caption', title: 'Caption', type: 'string' }),
    defineField({
      name: 'credit',
      title: 'Photo Credit',
      type: 'string',
      description: 'Photographer name shown below the photo.',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      description: 'Optional date shown below the photo.',
    }),
  ],
  orderings: [
    { title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'Date, newest', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'alt', subtitle: 'caption', media: 'image', enabled: 'enabled' },
    prepare: ({ title, subtitle, media, enabled }) => ({
      title: title ?? 'Photo',
      subtitle: [enabled === false ? 'Disabled' : null, subtitle].filter(Boolean).join(' · '),
      media,
    }),
  },
});
