import { createClient } from 'next-sanity';
import { requireSession } from '@/lib/session';

export async function POST(request: Request) {
  const sessionResponse = requireSession(request);
  if (sessionResponse) return sessionResponse;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !dataset || !token) return new Response('Not configured.', { status: 503 });
  const client = createClient({
    projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false, maxRetries: 0, timeout: 10_000,
  });
  const cutoff = new Date(Date.now() - 2 * 86_400_000).toISOString();
  try {
    await client.delete({ query: '*[_type == "clickHash" && _createdAt < $cutoff]', params: { cutoff } });
  } catch {
    console.error('Release click hash cleanup failed.');
    return new Response('Cleanup failed.', { status: 503 });
  }
  return new Response(null, { status: 204 });
}
