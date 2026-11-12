import type { StructureResolver } from 'sanity/structure';

// Singleton documents: the website queries them by fixed _id.
export const singletonTypes = ['siteSettings', 'pressKit', 'impressum'] as const;

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      ...singletonTypes.map((type) => {
        const title =
          type === 'siteSettings' ? 'Site Settings' : type === 'pressKit' ? 'Press Kit' : 'Impressum & Datenschutz';
        return S.listItem().title(title).id(type).child(S.document().schemaType(type).documentId(type));
      }),
      S.divider(),
      S.documentTypeListItem('release').title('Releases'),
      S.documentTypeListItem('member').title('Band Members'),
      S.documentTypeListItem('show').title('Tour Dates'),
      S.documentTypeListItem('photo').title('Gallery Photos'),
      S.documentTypeListItem('video').title('Gallery Videos'),
    ]);
