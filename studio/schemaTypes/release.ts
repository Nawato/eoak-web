import { defineArrayMember, defineField, defineType } from 'sanity';
import ReleaseStatistics from '../components/ReleaseStatistics';

export default defineType({
  name: 'release',
  title: 'Release',
  type: 'document',
  fieldsets: [
    { name: 'campaign', title: 'Release Campaign' },
    { name: 'tracklist', title: 'Tracklist' },
    { name: 'credits', title: 'Credits' },
    { name: 'overrides', title: 'Per-release Overrides', description: 'Leave unset to follow the global feature toggles in Site Settings.' },
  ],
  fields: [
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      description: 'Disabled releases are hidden from all lists, archive pages, sitemap and direct URLs.',
      initialValue: true,
    }),
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
      name: 'preSaveUrl',
      title: 'Pre-save URL',
      type: 'url',
      fieldset: 'campaign',
      description: 'Shown as a Pre-save button while the release is upcoming.',
      validation: (Rule) => Rule.uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'preOrderUrl',
      title: 'Pre-order URL',
      type: 'url',
      fieldset: 'campaign',
      description: 'Shown as a Pre-order button while the release is upcoming.',
      validation: (Rule) => Rule.uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'tracklist',
      title: 'Tracklist',
      type: 'array',
      fieldset: 'tracklist',
      of: [
        defineArrayMember({
          name: 'track',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'duration',
              title: 'Duration',
              type: 'string',
              description: 'Optional, e.g. 4:12.',
            }),
            defineField({
              name: 'lyrics',
              title: 'Lyrics',
              type: 'text',
              rows: 6,
              description: 'Optional. Shown in a collapsible section below the track.',
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'duration' },
          },
        }),
      ],
    }),
    defineField({
      name: 'credits',
      title: 'Credits',
      type: 'object',
      fieldset: 'credits',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'producer', title: 'Producer', type: 'string' }),
        defineField({ name: 'mixing', title: 'Mixing', type: 'string' }),
        defineField({ name: 'mastering', title: 'Mastering', type: 'string' }),
        defineField({ name: 'artwork', title: 'Artwork', type: 'string' }),
        defineField({ name: 'label', title: 'Label', type: 'string' }),
        defineField({ name: 'catalogNumber', title: 'Catalog Number', type: 'string' }),
        defineField({
          name: 'additional',
          title: 'Additional Credits',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'additionalCredit',
              type: 'object',
              fields: [
                defineField({ name: 'role', title: 'Role', type: 'string', validation: (Rule) => Rule.required() }),
                defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
              ],
              preview: { select: { title: 'role', subtitle: 'name' } },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'countdownEnabled',
      title: 'Show Countdown',
      type: 'boolean',
      fieldset: 'overrides',
      description: 'Unset: use the global setting. Off: hide the countdown for this release.',
    }),
    defineField({
      name: 'tracklistEnabled',
      title: 'Show Tracklist',
      type: 'boolean',
      fieldset: 'overrides',
      description: 'Unset: use the global setting. Off: hide the tracklist for this release.',
    }),
    defineField({
      name: 'creditsEnabled',
      title: 'Show Credits',
      type: 'boolean',
      fieldset: 'overrides',
      description: 'Unset: use the global setting. Off: hide the credits for this release.',
    }),
    defineField({
      name: 'shareEnabled',
      title: 'Show Share Buttons',
      type: 'boolean',
      fieldset: 'overrides',
      description: 'Unset: use the global setting. Off: hide share buttons for this release.',
    }),
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
