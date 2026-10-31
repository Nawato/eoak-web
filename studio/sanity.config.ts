import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import { structure, singletonTypes } from './structure';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? 'lru32awc';
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';

export default defineConfig({
  name: 'endofallknown',
  title: 'End Of All Known',
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !['releaseLinkStats', 'clickHash'].includes(schemaType)),
  },
  document: {
    // Singletons can only be edited, never created or duplicated.
    actions: (input, context) =>
      ['releaseLinkStats', 'clickHash'].includes(context.schemaType)
        ? []
        : (singletonTypes as readonly string[]).includes(context.schemaType)
        ? input.filter(({ action }) => action && !['duplicate', 'delete', 'unpublish'].includes(action))
        : input,
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global'
        ? prev.filter((item) => !(singletonTypes as readonly string[]).includes(item.templateId))
        : prev,
  },
});
