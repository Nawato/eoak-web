import { defineType } from 'sanity';

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
    {
      name: 'pressKitPdf',
      title: 'Press Kit PDF',
      type: 'file',
      description: 'Press kit PDF download for the press.',
    },
    {
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'galleryImage',
          fields: [
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              validation: (rule) => rule.required(),
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
            {
              name: 'isHighRes',
              title: 'High Resolution',
              type: 'boolean',
              initialValue: false,
            },
          ],
        },
      ],
    },
  ],
});
