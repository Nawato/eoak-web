import { defineType } from 'sanity';

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
              validation: (Rule) => Rule.required(),
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
      name: 'bandsintownArtistName',
      title: 'Bandsintown Artist Name',
      type: 'string',
      initialValue: 'End Of All Known',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'bookingEmail',
      title: 'Booking Email',
      type: 'email',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'managementEmail',
      title: 'Management Email',
      type: 'email',
      validation: (Rule) => Rule.required(),
    },
  ],
});
