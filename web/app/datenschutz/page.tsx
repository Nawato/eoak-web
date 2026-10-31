import type { Metadata } from 'next';
import Link from 'next/link';
import { getImpressum } from '@/lib/sanity';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
};

export default async function DatenschutzPage() {
  const impressum = await getImpressum();
  const email = impressum?.email;

  return (
    <section lang="de" className="mx-auto max-w-3xl px-4 py-24">
      <h1 className="mb-8 text-4xl font-display text-white">Datenschutzerklärung</h1>
      <div className="space-y-8 text-zinc-400 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:text-white [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
        <section>
          <h2>1. Verantwortlicher</h2>
          {impressum ? (
            <p>
              {impressum.operatorName}
              <br />
              {impressum.operatorAddress}
              <br />
              E-Mail:{' '}
              <a href={`mailto:${impressum.email}`} className="text-accent hover:text-rose-300">
                {impressum.email}
              </a>
            </p>
          ) : (
            <p>Siehe Impressum.</p>
          )}
        </section>

        <section>
          <h2>2. Hosting und Server-Logfiles</h2>
          <p>
            Beim Aufruf dieser Website verarbeitet der Hosting-Anbieter technisch notwendige Daten (IP-Adresse,
            Datum und Uhrzeit, aufgerufene Seite, Browser- und Betriebssysteminformationen), um die Website
            auszuliefern und ihre Sicherheit zu gewährleisten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO
            (berechtigtes Interesse an einem sicheren und stabilen Betrieb). Logdaten werden nur so lange
            gespeichert, wie es für diesen Zweck erforderlich ist.
          </p>
        </section>

        <section>
          <h2>3. Inhalte (Sanity)</h2>
          <p>
            Die Inhalte dieser Website werden im Content-Management-System Sanity (Sanity AS, Norwegen) gepflegt.
            Bilder werden über das Sanity-CDN (cdn.sanity.io) geladen; dabei wird Ihre IP-Adresse an den Anbieter
            übermittelt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
          </p>
        </section>

        <section>
          <h2>4. Kontaktformular</h2>
          <p>
            Wenn Sie das Kontaktformular nutzen, verarbeiten wir Name, E-Mail-Adresse und Ihre Nachricht, um Ihre
            Anfrage zu beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) bzw.
            Art. 6 Abs. 1 lit. f DSGVO. Der Versand erfolgt über den E-Mail-Dienstleister Resend (Resend, Inc., USA)
            als Auftragsverarbeiter; die Übermittlung in die USA stützt sich auf geeignete Garantien nach Art. 46
            DSGVO. Zur Missbrauchsabwehr wird Ihre IP-Adresse kurzzeitig im Arbeitsspeicher zur Begrenzung der
            Anfragehäufigkeit verwendet. Ihre Anfrage löschen wir, sobald sie erledigt ist und keine gesetzlichen
            Aufbewahrungspflichten entgegenstehen.
          </p>
        </section>

        <section>
          <h2>5. Eingebettete Inhalte von Drittanbietern</h2>
          <p>
            Diese Website bindet Inhalte von YouTube (Google Ireland Limited, Irland; Einbettung im
            erweiterten Datenschutzmodus), Spotify (Spotify AB, Schweden) und Bandsintown (Bandsintown, Inc., USA)
            ein. Diese Inhalte werden erst geladen, nachdem Sie auf die jeweilige Schaltfläche geklickt und damit
            eingewilligt haben (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG). Beim Laden wird Ihre IP-Adresse an
            den jeweiligen Anbieter übermittelt, der außerdem Cookies oder ähnliche Technologien einsetzen kann.
          </p>
          <p className="mt-3">
            Ihre Einwilligung wird in Ihrem Browser (localStorage) gespeichert. Ist dieser Speicher gesperrt,
            gilt Ihre Auswahl nur bis zum erneuten Laden der Seite. Sie können sie jederzeit über den
            Link „Revoke … consent“ unter dem jeweiligen Inhalt mit Wirkung für die Zukunft widerrufen.
          </p>
        </section>

        <section>
          <h2>6. Ihre Rechte</h2>
          <p>Sie haben gegenüber uns das Recht auf:</p>
          <ul>
            <li>Auskunft (Art. 15 DSGVO)</li>
            <li>Berichtigung (Art. 16 DSGVO)</li>
            <li>Löschung (Art. 17 DSGVO)</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21 DSGVO)</li>
            <li>Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO)</li>
          </ul>
          <p className="mt-3">
            Zur Ausübung Ihrer Rechte schreiben Sie uns
            {email ? (
              <>
                {' '}
                an{' '}
                <a href={`mailto:${email}`} className="text-accent hover:text-rose-300">
                  {email}
                </a>
              </>
            ) : (
              ' (Kontaktdaten siehe Impressum)'
            )}
            . Außerdem haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77
            DSGVO).
          </p>
        </section>

        <p>
          <Link href="/" className="text-accent hover:text-rose-300">
            ← Zurück zur Startseite
          </Link>
        </p>
      </div>
    </section>
  );
}
