import { defineConfig } from 'sanity';
import siteSettings from './sanity/schemas/siteSettings';
import pressKit from './sanity/schemas/pressKit';
import impressum from './sanity/schemas/impressum';

export default defineConfig({
  name: 'endofallknown',
  title: 'End Of All Known',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '8a1b2c3d4e5',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  plugins: [],
  schema: {
    types: [siteSettings, pressKit, impressum],
  },
});
