import { defineType } from 'sanity';

export default defineType({
  name: 'release',
  title: 'Release',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() },
    {
      name: 'releaseType',
      title: 'Type',
      type: 'string',
      options: { list: ['Album', 'EP', 'Single'] },
      initialValue: 'Single',
    },
    { name: 'releaseDate', title: 'Release Date', type: 'date', validation: (Rule) => Rule.required() },
    { name: 'cover', title: 'Cover Art', type: 'image', validation: (Rule) => Rule.required() },
    {
      name: 'links',
      title: 'Listen Links',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'releaseLink',
          fields: [
            { name: 'label', title: 'Label', type: 'string', description: 'e.g. Spotify, Bandcamp', validation: (Rule) => Rule.required() },
            { name: 'url', title: 'URL', type: 'url', validation: (Rule) => Rule.required().uri({ scheme: ['https'] }) },
          ],
          preview: { select: { title: 'label', subtitle: 'url' } },
        },
      ],
    },
  ],
  orderings: [{ title: 'Release date, newest', name: 'dateDesc', by: [{ field: 'releaseDate', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'releaseDate', media: 'cover' } },
});
