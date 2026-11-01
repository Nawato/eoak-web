// Shared cache tag so content fetches (server components and /go) can be invalidated
// together by the Sanity webhook without importing the Sanity client module.
export const SANITY_CACHE_TAG = 'sanity';
