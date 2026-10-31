import { defineField, defineType } from 'sanity';

// Technical documents are managed only by the web server, never by publishing releases.
export const releaseAnalyticsTypes = [
  defineType({
    name: 'releaseLinkStats',
    title: 'Release Link Statistics',
    type: 'document',
    readOnly: true,
    fields: [
      defineField({ name: 'releaseId', type: 'string' }),
      defineField({ name: 'linkKey', type: 'string' }),
      defineField({ name: 'clicks', type: 'number' }),
      defineField({ name: 'uniqueClicks', type: 'number' }),
    ],
  }),
  defineType({
    name: 'clickHash',
    title: 'Daily Click Deduplication',
    type: 'document',
    readOnly: true,
    fields: [defineField({ name: 'day', type: 'date' })],
  }),
];
