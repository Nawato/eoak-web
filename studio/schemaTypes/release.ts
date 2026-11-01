import { defineArrayMember, defineField, defineType } from 'sanity';
import ReleaseStatistics from '../components/ReleaseStatistics';

export default defineType({
  name: 'release',
  title: 'Release',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'releaseType',
      title: 'Type',
      type: 'string',
      options: { list: ['Album', 'EP', 'Single'] },
      initialValue: 'Single',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Creates the release page at /releases/<slug>. Without a slug the release only appears in the list.',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) =>
        Rule.custom(async (value: { current?: string } | undefined, context) => {
          const slug = value?.current?.trim();
          if (!slug) return true;
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            return 'Use lowercase letters, numbers and single hyphens.';
          }
          // Slugs are the public URL, so two releases must never share one.
          const id = context.document?._id?.replace(/^drafts\./, '');
          const client = context.getClient({ apiVersion: '2024-01-01' });
          const matches = await client.fetch<number>(
            'count(*[_type == "release" && slug.current == $slug && _id != $draft && _id != $published])',
            { slug, draft: id ? `drafts.${id}` : '', published: id ?? '' },
          );
          return matches === 0 || 'This slug is already used by another release.';
        }),
    }),
    defineField({
      name: 'teaser',
      title: 'Teaser Text',
      type: 'text',
      rows: 4,
      description: 'Short text for the release page, e.g. a teaser for an upcoming release.',
    }),
    defineField({
      name: 'releaseDate',
      type: 'date',
      description: 'Future dates show as upcoming; releases switch on the Europe/Berlin release day.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'cover', title: 'Cover Art', type: 'image', options: { hotspot: true }, validation: (Rule) => Rule.required() }),
    defineField({
      name: 'links',
      title: 'Listen Links',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'releaseLink',
          fields: [
            defineField({ name: 'label', type: 'string', description: 'e.g. Spotify, Bandcamp', validation: (Rule) => Rule.required() }),
            defineField({ name: 'url', title: 'URL', type: 'url', validation: (Rule) => Rule.required().uri({ scheme: ['https'] }) }),
            defineField({
              name: 'clicks',
              title: 'Clicks',
              type: 'number',
              description: 'Legacy counter. Live statistics are shown below the links.',
              hidden: true,
              readOnly: true,
              initialValue: 0,
            }),
            defineField({
              name: 'uniqueClicks',
              title: 'Unique clicks (per day)',
              type: 'number',
              description: 'Legacy counter. Live statistics are shown below the links.',
              readOnly: true,
              hidden: true,
              initialValue: 0,
            }),
          ],
          preview: {
            select: { title: 'label', url: 'url' },
            prepare: ({ title, url }) => ({
              title,
              subtitle: url,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'statistics',
      title: 'Live Click Statistics',
      type: 'string',
      readOnly: true,
      components: { input: ReleaseStatistics },
    }),
  ],
  orderings: [{ title: 'Release date, newest', name: 'dateDesc', by: [{ field: 'releaseDate', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', subtitle: 'releaseDate', media: 'cover' },
  },
});
