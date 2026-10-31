import { defineField } from 'sanity';

const areas = [
  ['music', 'Music'],
  ['releases', 'Releases'],
  ['shows', 'Tour Dates'],
  ['bio', 'Bio / Press'],
  ['band', 'The Band'],
  ['contact', 'Contact'],
  ['impressum', 'Impressum'],
  ['privacy', 'Privacy / Datenschutz'],
] as const;

export default defineField({
  name: 'pageBackgrounds',
  title: 'Page & Section Backgrounds',
  type: 'object',
  description: 'Optional independent backgrounds. The hero keeps its existing background settings.',
  fields: areas.map(([name, title]) => defineField({
    name,
    title,
    type: 'object',
    options: { collapsible: true, collapsed: true },
    fields: [
      defineField({
        name: 'image',
        title: 'Background Image',
        type: 'image',
        options: { hotspot: true },
        description: 'Landscape photo recommended. Set the hotspot to keep the subject visible.',
      }),
      defineField({
        name: 'alt',
        title: 'Image Description',
        type: 'string',
        description: 'Leave empty if the photo is purely decorative.',
      }),
      defineField({
        name: 'overlayOpacity',
        title: 'Photo Darkening (%)',
        type: 'number',
        initialValue: 65,
        description: '0 keeps the photo bright; 85 makes it very dark. Default: 65. Keep text readable.',
        validation: (rule) => rule.min(0).max(85).integer(),
      }),
    ],
  })),
});
