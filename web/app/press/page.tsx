import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { getSiteSettings } from '@/lib/sanity';
import { resolveFeatures } from '@/lib/features';
import { toHttpsUrl } from '@/lib/embeds';

export const dynamic = 'force-dynamic';

/**
 * Press / EPK is an external cloud folder, never a content page. The route only
 * exists while the feature is enabled and the configured URL is a valid HTTPS URL.
 */
export default async function PressPage() {
  await connection();
  const settings = await getSiteSettings();
  const features = resolveFeatures(settings?.features);
  const pressUrl = features.pressLink ? toHttpsUrl(settings?.pressUrl) : null;
  if (!pressUrl) notFound();
  redirect(pressUrl);
}
