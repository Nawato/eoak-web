import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'member',
  title: 'Band Member',
  type: 'document',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      description: 'Disabled members are hidden from the website.',
      initialValue: true,
    }),
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'role', title: 'Role', type: 'string', description: 'e.g. Vocals, Guitar' }),
    defineField({
      name: 'instrument',
      title: 'Instrument',
      type: 'string',
      description: 'Optional instrument or function shown on the member card, e.g. Lead guitar.',
    }),
    defineField({
      name: 'bio',
      title: 'Short Bio',
      type: 'text',
      rows: 4,
      description: 'Optional short biography shown on the member card.',
    }),
    defineField({
      name: 'yearsActive',
      title: 'Years Active',
      type: 'string',
      description: 'Optional, e.g. 2018–present.',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Member Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'memberSocialLink',
          fields: [
            {
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'YouTube', value: 'youtube' },
                  { title: 'X (Twitter)', value: 'twitter' },
                  { title: 'Facebook', value: 'facebook' },
                  { title: 'TikTok', value: 'tiktok' },
                  { title: 'Spotify', value: 'spotify' },
                  { title: 'Apple Music', value: 'applemusic' },
                  { title: 'Bandcamp', value: 'bandcamp' },
                  { title: 'SoundCloud', value: 'soundcloud' },
                  { title: 'Bluesky', value: 'bluesky' },
                  { title: 'Threads', value: 'threads' },
                  { title: 'Discord', value: 'discord' },
                  { title: 'Patreon', value: 'patreon' },
                  { title: 'Twitch', value: 'twitch' },
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required().uri({ scheme: ['https'] }),
            },
          ],
          preview: { select: { title: 'platform', subtitle: 'url' } },
        },
      ],
    }),
    defineField({ name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first.',
      initialValue: 10,
    }),
  ],
  orderings: [{ title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } },
});
