import { useEffect, useState } from 'react';
import { useClient, useFormValue } from 'sanity';

type Link = { _key: string; label?: string; clicks?: number; uniqueClicks?: number };
type Stats = { linkKey: string; clicks: number; uniqueClicks: number };

export default function ReleaseStatistics() {
  const client = useClient({ apiVersion: '2024-01-01' });
  const documentId = useFormValue(['_id']);
  const links = useFormValue(['links']) as Link[] | undefined;
  const [stats, setStats] = useState<Stats[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof documentId !== 'string') return;
    const releaseId = documentId.replace(/^drafts\./, '');
    const query = '*[_type == "releaseLinkStats" && releaseId == $releaseId]{linkKey, clicks, uniqueClicks}';
    let active = true;
    let generation = 0;
    const refresh = async () => {
      const current = ++generation;
      try {
        const result = await client.fetch<Stats[]>(query, { releaseId }, { perspective: 'published' });
        if (active && current === generation) {
          setStats(result);
          setError(false);
          setLoading(false);
        }
      } catch {
        if (active && current === generation) {
          setError(true);
          setLoading(false);
        }
      }
    };
    void refresh();
    const subscription = client.listen(query, { releaseId }, { includeResult: false }).subscribe({
      next: () => { void refresh(); },
      error: () => { if (active) setError(true); },
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [client, documentId]);

  if (error) return <p role="alert">Could not load live click statistics. Reopen this release to retry.</p>;
  if (loading) return <p>Loading click statistics...</p>;
  return (
    <div>
      <p>Lifetime clicks and cumulative daily unique IPs (not unique people). Counters survive publishing edits.</p>
      <ul>
        {(links ?? []).map((link) => {
          const current = stats.find((entry) => entry.linkKey === link._key);
          return (
            <li key={link._key}>
              {link.label ?? 'Link'}: {current?.clicks ?? link.clicks ?? 0} clicks;{' '}
              {current?.uniqueClicks ?? link.uniqueClicks ?? 0} daily uniques
            </li>
          );
        })}
      </ul>
    </div>
  );
}
