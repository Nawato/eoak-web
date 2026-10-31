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
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Creates the release page at /releases/<slug>. Without a slug the release only appears in the list.',
      options: { source: 'title', maxLength: 96 },
    },
    {
      name: 'teaser',
      title: 'Teaser Text',
      type: 'text',
      rows: 4,
      description: 'Short text for the release page, e.g. a teaser for an upcoming release.',
    },
    { name: 'releaseDate', title: 'Release Date', type: 'date', validation: (Rule) => Rule.required() },
    { name: 'cover', title: 'Cover Art', type: 'image', options: { hotspot: true }, validation: (Rule) => Rule.required() },
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
            {
              name: 'clicks',
              title: 'Clicks',
              type: 'number',
              description: 'Counted automatically when visitors follow this link from the website.',
              readOnly: true,
              initialValue: 0,
            },
          ],
          preview: {
            select: { title: 'label', url: 'url', clicks: 'clicks' },
            prepare: ({ title, url, clicks }) => ({ title, subtitle: `${clicks ?? 0} clicks · ${url ?? ''}` }),
          },
        },
      ],
    },
  ],
  orderings: [{ title: 'Release date, newest', name: 'dateDesc', by: [{ field: 'releaseDate', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', date: 'releaseDate', media: 'cover', links: 'links' },
    prepare: ({ title, date, media, links }) => {
      const clicks = ((links ?? []) as { clicks?: number }[]).reduce((sum, link) => sum + (link.clicks ?? 0), 0);
      return { title, subtitle: `${date ?? ''} · ${clicks} clicks`, media };
    },
  },
});
