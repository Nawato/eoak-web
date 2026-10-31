import type { Impressum } from '@/lib/sanity';

export default function LegalContact({ operator }: { operator: Impressum | null }) {
  if (!operator) return <p>Die Angaben zum Verantwortlichen sind noch nicht hinterlegt.</p>;
  const incomplete =
    !operator.operatorName?.trim() ||
    !operator.operatorAddress?.trim() ||
    !operator.email?.trim() ||
    /musterstra(?:ß|ss)e|12345 berlin/i.test(operator.operatorAddress) ||
    operator.representedBy === 'Booking & Management';
  return (
    <div className="space-y-3">
      {incomplete && (
        <p role="status" className="rounded-sm border border-amber-500/40 p-4">
          Die Betreiberangaben sind noch unvollständig oder enthalten Musterangaben.
        </p>
      )}
      <p className="whitespace-pre-line">
        {operator.operatorName}
        {operator.legalForm && (
          <>
            <br />
            {operator.legalForm}
          </>
        )}
        <br />
        {operator.operatorAddress}
      </p>
      {operator.representedBy && <p>Vertreten durch: {operator.representedBy}</p>}
      <p>
        E-Mail:{' '}
        <a href={`mailto:${operator.email}`} className="text-accent underline">
          {operator.email}
        </a>
        {operator.phone && (
          <>
            <br />
            Telefon: {operator.phone}
          </>
        )}
      </p>
    </div>
  );
}
