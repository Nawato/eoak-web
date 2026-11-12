import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'show',
  title: 'Tour Date',
  type: 'document',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      description: 'Disabled shows are hidden from the website and sitemap.',
      initialValue: true,
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      description: 'The show date is evaluated in the Europe/Berlin time zone.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'startTime',
      title: 'Start Time',
      type: 'string',
      description: 'Optional local start time, e.g. 20:00.',
      validation: (Rule) =>
        Rule.custom((value) =>
          value === undefined || value === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
            ? true
            : 'Use a 24-hour time such as 20:00.',
        ),
    }),
    defineField({ name: 'venue', title: 'Venue', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'city', title: 'City', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'region', title: 'Region / State', type: 'string' }),
    defineField({ name: 'country', title: 'Country', type: 'string' }),
    defineField({
      name: 'ticketUrl',
      title: 'Ticket URL',
      type: 'url',
      validation: (Rule) => Rule.uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'soldOut',
      title: 'Sold Out',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'support',
      title: 'Support Acts',
      type: 'string',
      description: 'Optional support acts shown below the venue.',
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'string',
      description: 'Optional short note, e.g. doors or age restriction.',
    }),
  ],
  orderings: [
    { title: 'Date, soonest', name: 'dateAsc', by: [{ field: 'date', direction: 'asc' }] },
    { title: 'Date, newest', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'venue', subtitle: 'date', city: 'city', enabled: 'enabled' },
    prepare: ({ title, subtitle, city, enabled }) => ({
      title: title ?? 'Show',
      subtitle: [enabled === false ? 'Disabled' : null, subtitle, city].filter(Boolean).join(' · '),
    }),
  },
});
