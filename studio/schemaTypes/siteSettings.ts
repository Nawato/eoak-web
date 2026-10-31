import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    {
      name: 'bandName',
      title: 'Band Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description: 'Band logo shown in the header and hero. PNG (transparent) or SVG recommended. Replaces the text name when set.',
      options: { accept: 'image/png,image/svg+xml,image/webp' },
    },
    {
      name: 'heroBackground',
      title: 'Hero Background Photo',
      type: 'image',
      description: 'Full-width band photo behind the hero. Landscape, at least 2000px wide. Set the hotspot to keep the band in frame.',
      options: { hotspot: true },
    },
    {
      name: 'heroBackgroundAlt',
      title: 'Hero Background Alt Text',
      type: 'string',
      description: 'Short description of the photo for screen readers.',
    },
    {
      name: 'heroEyebrow',
      title: 'Hero Eyebrow Text',
      type: 'string',
      initialValue: 'Independent Metalcore',
    },
    {
      name: 'heroTagline',
      title: 'Hero Tagline',
      type: 'text',
      rows: 3,
      initialValue: 'Heavy riffs. Bleak atmospheres. Emotional breakdowns. The soundtrack of the void.',
    },
    {
      name: 'ogImage',
      title: 'Social Sharing Image',
      type: 'image',
      description: 'Image shown when the site is shared (1200x630 recommended). Falls back to a generated image.',
    },
    {
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      description: 'Square PNG, at least 512x512.',
      options: { accept: 'image/png' },
    },
    {
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'socialLink',
          fields: [
            {
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: ['instagram', 'youtube', 'twitter', 'facebook', 'tiktok'],
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
        },
      ],
      validation: (Rule) => Rule.unique(),
    },
    {
      name: 'latestYoutubeUrl',
      title: 'Latest YouTube URL',
      type: 'url',
      description: 'Full URL of the latest release / music video (youtube.com/watch?v=...).',
    },
    {
      name: 'featuredSpotifyUrl',
      title: 'Featured Spotify URL',
      type: 'url',
      description: 'Full URL of the featured release (open.spotify.com/...).',
    },
    {
      name: 'streamingLinks',
      title: 'Streaming Links',
      type: 'array',
      description: 'Shown as buttons in the Music section (Spotify, Apple Music, Bandcamp, ...).',
      of: [
        {
          type: 'object',
          name: 'streamingLink',
          fields: [
            { name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'url', title: 'URL', type: 'url', validation: (Rule) => Rule.required().uri({ scheme: ['https'] }) },
          ],
          preview: { select: { title: 'label', subtitle: 'url' } },
        },
      ],
    },
    {
      name: 'merchUrl',
      title: 'Merch Shop URL',
      type: 'url',
      description: 'Adds a "Merch" button to the hero when set.',
      validation: (Rule) => Rule.uri({ scheme: ['https'] }),
    },
    {
      name: 'bandsintownArtistName',
      title: 'Bandsintown Artist Name',
      type: 'string',
      initialValue: 'End Of All Known',
      validation: (Rule) => Rule.required(),
    },
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'email',
      description: 'One inbox for booking, management and all other inquiries.',
      initialValue: 'kontakt@endofallknown.de',
      validation: (Rule) => Rule.required(),
    }),
  ],
});
