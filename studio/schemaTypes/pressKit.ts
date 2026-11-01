import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'pressKit',
  title: 'Press Kit',
  type: 'document',
  fields: [
    {
      name: 'biography',
      title: 'Biography',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Press biography (paragraphs & headings).',
    },
    {
      name: 'pressRelease',
      title: 'Press Release',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Press release content (paragraphs & headings).',
    },
    defineField({
      name: 'pressKitUrl',
      title: 'Complete Press Kit Link',
      type: 'url',
      description: 'Google Drive folder with logos, press photos, riders and other press materials. Set sharing to "Anyone with the link" with Viewer access. Takes priority over the PDF download.',
      validation: (rule) => rule.uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'pressKitLinkLabel',
      title: 'Press Kit Button Label',
      type: 'string',
      initialValue: 'Open Press Kit',
      validation: (rule) => rule.custom((value) =>
        value !== undefined && !value.trim() ? 'Enter a label or clear the field to use the default.' : true,
      ),
    }),
    {
      name: 'pressKitPdf',
      title: 'Press Kit PDF',
      type: 'file',
      options: { accept: 'application/pdf' },
      description: 'Optional fallback download, shown only when no complete press kit link is configured.',
    },
  ],
});
