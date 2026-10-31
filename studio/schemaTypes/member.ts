import { defineType } from 'sanity';

export default defineType({
  name: 'member',
  title: 'Band Member',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() },
    { name: 'role', title: 'Role', type: 'string', description: 'e.g. Vocals, Guitar' },
    { name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true } },
    { name: 'order', title: 'Order', type: 'number', description: 'Lower numbers appear first.', initialValue: 10 },
  ],
  orderings: [{ title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } },
});
