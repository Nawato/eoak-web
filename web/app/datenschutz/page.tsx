import type { Metadata } from 'next';
import Link from 'next/link';
import { getImpressum, getSiteSettings } from '@/lib/sanity';
import BackgroundSurface from '@/components/BackgroundSurface';
import LegalContact from '@/components/LegalContact';
import PrivacyControls from '@/components/PrivacyControls';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  alternates: { canonical: '/datenschutz' },
};

export default async function DatenschutzPage() {
  const [impressum, settings] = await Promise.all([getImpressum(), getSiteSettings()]);
  const incomplete =
    !impressum?.hostingDetails?.trim() ||
    !impressum?.emailProcessingDetails?.trim() ||
    !impressum?.internationalTransfers?.trim() ||
    !impressum?.supervisoryAuthority?.trim();

  return (
    <BackgroundSurface background={settings?.pageBackgrounds?.privacy}>
      <section lang="de" className="mx-auto max-w-3xl px-4 py-24">
        <h1 className="mb-8 text-4xl font-display text-white">Datenschutzerklärung</h1>
        <div className="space-y-8 text-zinc-400 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:text-white [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-white [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_a]:text-accent [&_a]:underline">
          {incomplete && (
            <p role="status" className="rounded-sm border border-amber-500/40 p-4">
              Diese Datenschutzhinweise sind noch unvollständig. Angaben zu Dienstleistern, Speicherfristen,
              Drittlandübermittlungen und der zuständigen Aufsichtsbehörde müssen vom Betreiber ergänzt werden.
            </p>
          )}
          <section>
            <h2>1. Verantwortlicher und Datenschutzkontakt</h2>
            <LegalContact operator={impressum} />
            {impressum?.dataProtectionOfficer && (
              <p className="whitespace-pre-line">Datenschutzbeauftragter: {impressum.dataProtectionOfficer}</p>
            )}
          </section>

          <section>
            <h2>2. Hosting, Sicherheit und Server-Logdaten</h2>
            <p>
              Beim Aufruf verarbeitet der Hosting-Anbieter insbesondere IP-Adresse, Zeitpunkt, angeforderte URL,
              übertragene Datenmenge, HTTP-Status sowie Browser-/Betriebssysteminformationen und gegebenenfalls die
              verweisende Seite. Dies dient der Auslieferung, Fehleranalyse und Abwehr von Angriffen. Rechtsgrundlage
              ist Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes Interesse ist ein sicherer, zuverlässiger Betrieb.
              Technische Dienstleister erhalten diese Daten im Rahmen ihrer Leistung.
            </p>
            <p className="whitespace-pre-line">
              {impressum?.hostingDetails ||
                'Hosting-Anbieter, Verarbeitungsorte und Log-Speicherfristen: noch nicht hinterlegt.'}
            </p>
            <p>Die Übertragung erfolgt über HTTPS, sofern die Website über ihre HTTPS-Adresse aufgerufen wird.</p>
          </section>

          <section>
            <h2>3. Website-Inhalte und Sanity-CDN</h2>
            <p>
              Wir verwalten Inhalte über Sanity (Sanity AS / Sanity US Inc.). Inhaltsabfragen erfolgen auf dem Server.
              Beim Laden von Bildern vom Sanity-CDN (cdn.sanity.io) erhält dessen Infrastruktur insbesondere Ihre
              IP-Adresse und technische Abrufdaten. Zweck ist die schnelle und zuverlässige Darstellung der Bandwebsite.
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Bereitstellung unserer
              Inhalte). Abrufprotokolle unterliegen den Speicherfristen des Dienstleisters.
            </p>
            <p>
              Details zu Infrastruktur, Empfängern und Speicherfristen:{' '}
              <a href="https://www.sanity.io/legal/privacy">Sanity-Datenschutzhinweise</a>. Schriftarten werden von
              unserer Website ausgeliefert; es erfolgt hierfür kein Abruf von Google Fonts durch Ihren Browser.
            </p>
            <h3>Klickstatistik für Release-Links</h3>
            <p>
              Beim Folgen eines Release-Links zählen wir den Aufruf serverseitig in Sanity. Sofern die
              IP-basierte Auswertung aktiviert ist, bilden wir aus der vom vertrauenswürdigen Proxy gelieferten
              IP-Adresse und dem UTC-Kalendertag einen geheimnisgeschützten Hash zur täglichen Deduplizierung.
              Die IP-Adresse selbst und Browserinformationen werden dabei nicht in Sanity gespeichert.
              Bekannte Bots und Vorladeaufrufe werden soweit erkennbar nicht gezählt. Es werden hierfür keine
              Cookies gesetzt und keine Daten im Browser gespeichert.
            </p>
            <p>
              Die pseudonymen Deduplizierungsdaten werden bei aktivierter täglicher Bereinigung nach 48 bis
              72 Stunden gelöscht; zusammengefasste Zähler bleiben erhalten. Die Statistik ist nur eine
              Näherung und erkennt keine einzelnen Personen. Rechtsgrundlage und Interessenabwägung sowie
              die tatsächliche Bereinigung und Sanity-Verarbeitung sind vor Aktivierung vom Betreiber zu prüfen.
            </p>
          </section>

          <section>
            <h2>4. Kontaktformular und E-Mail</h2>
            <p>
              Wir verarbeiten Name, E-Mail-Adresse, Nachricht und Kommunikationsdaten, um Ihre Anfrage zu beantworten.
              Bei Buchungs- oder Vertragsanfragen ist die Rechtsgrundlage Art. 6 Abs. 1 lit. b DSGVO, bei sonstigen
              Anfragen Art. 6 Abs. 1 lit. f DSGVO (Interesse an der Bearbeitung eingehender Kommunikation). Die Angaben
              sind nicht gesetzlich vorgeschrieben, aber für den Versand über das Formular erforderlich. Ohne
              E-Mail-Adresse können wir nicht antworten. Alternativ können Sie direkt eine E-Mail senden.
            </p>
            <p>
              Der Formularversand erfolgt über Resend (laut Anbieter Plus Five Five, Inc., USA) an unser
              Kontaktpostfach. Dabei werden Ihre Formulardaten an den Versanddienst und unseren Postfachanbieter
              übermittelt. Ihre E-Mail-Adresse wird als Antwortadresse verwendet, nicht als Absenderadresse. Die Website
              speichert keine eigene Nachrichtendatenbank.
            </p>
            <p>
              Zur Missbrauchsabwehr werden, sofern vom Host übermittelt, IP-Adresse und Versandzeitpunkte vorübergehend
              im Arbeitsspeicher zur Begrenzung auf drei Anfragen innerhalb von zehn Minuten verarbeitet. Veraltete
              Einträge werden bei Bereinigung oder Neustart des Serverprozesses entfernt. Rechtsgrundlage ist Art. 6
              Abs. 1 lit. f DSGVO (Schutz vor Spam und Missbrauch).
            </p>
            <p className="whitespace-pre-line">
              {impressum?.emailProcessingDetails ||
                'Postfachanbieter, Versandprotokoll- und Nachrichten-Speicherfristen: noch nicht hinterlegt.'}
            </p>
            <p>
              Nachrichten werden gelöscht, sobald ihre Bearbeitung abgeschlossen ist und keine gesetzlichen
              Aufbewahrungspflichten oder berechtigten Gründe, etwa die Rechtsverteidigung, entgegenstehen. Details zum
              Versanddienst: <a href="https://resend.com/legal/privacy-policy">Resend-Datenschutzhinweise</a>.
            </p>
          </section>

          <section>
            <h2>5. Externe Medien und Einwilligung</h2>
            <p>
              YouTube, Spotify, Instagram-Fotos und Bandsintown werden erst nach Ihrer freiwilligen,
              anbieterspezifischen Einwilligung geladen. Ohne Einwilligung können Sie die übrige Website nutzen.
              Rechtsgrundlage für die Datenverarbeitung ist Art. 6 Abs. 1 lit. a DSGVO; soweit Informationen auf Ihrem
              Endgerät gespeichert oder ausgelesen werden, gilt § 25 Abs. 1 TDDDG. Beim Laden erhalten Anbieter
              insbesondere IP-Adresse, Browserdaten, Zeitpunkt und ggf. die Herkunftsseite. Abhängig vom Dienst können
              Cookies oder ähnliche Kennungen für Nutzungsanalyse, Profilbildung oder Werbung eingesetzt und Daten mit
              einem beim Anbieter angemeldeten Konto verknüpft werden.
            </p>
            <ul>
              <li>
                YouTube (Google Ireland Limited): Videowiedergabe über youtube-nocookie.com. Der erweiterte
                Datenschutzmodus verhindert nicht jede Datenübermittlung.{' '}
                <a href="https://policies.google.com/privacy?hl=de">Datenschutz bei Google</a>.
              </li>
              <li>
                Spotify (Spotify AB): Wiedergabe der eingebetteten Veröffentlichung.{' '}
                <a href="https://www.spotify.com/de/legal/privacy-policy/">Datenschutz bei Spotify</a>.
              </li>
              <li>
                Instagram (Meta Platforms Ireland Limited): Anzeige der neuesten sechs Beiträge als Bilder. Die
                API-Abfrage erfolgt serverseitig mit einem Cache-Intervall von 15 Minuten; dabei wird keine Besucher-IP
                an die API übermittelt. Nach Einwilligung lädt Ihr Browser Fotos bzw. Video-Vorschaubilder direkt vom
                Meta-CDN (cdninstagram.com / fbcdn.net). Ein Klick öffnet den Originalbeitrag.{' '}
                <a href="https://privacycenter.instagram.com/policy/">Datenschutz bei Instagram</a>.
              </li>
              <li>
                Bandsintown (Bandsintown, Inc.): Anzeige von Konzertterminen durch ein externes Widget und dessen API.{' '}
                <a href="https://corp.bandsintown.com/privacy">Datenschutz bei Bandsintown</a>.
              </li>
            </ul>
            <p>
              Die eigenständige Verarbeitung durch Medienanbieter und deren Speicherfristen richten sich nach den
              verlinkten Datenschutzhinweisen. Insbesondere können Daten in den USA verarbeitet werden; Hinweise zu den
              tatsächlich verwendeten Übermittlungsgrundlagen finden Sie in Abschnitt 7.
            </p>
            <h3>Einwilligung speichern und widerrufen</h3>
            <p>
              Ihre Auswahl wird unter den Schlüsseln „eoak-consent:YouTube“, „eoak-consent:Spotify“,
              „eoak-consent:Instagram“ und „eoak-consent:Bandsintown“ im localStorage Ihres Browsers gespeichert.
              Einträge haben derzeit keine automatische Ablaufzeit; sie bleiben bis zum Widerruf oder Löschen der
              Browserdaten bestehen. Bei gesperrtem Speicher gilt die Auswahl nur bis zum erneuten Laden. Die
              Speicherung der von Ihnen angeforderten Datenschutzauswahl dient deren Umsetzung (§ 25 Abs. 2 Nr. 2 TDDDG;
              Art. 6 Abs. 1 lit. f DSGVO).
            </p>
            <p>
              Sie können Ihre Einwilligung jederzeit über „Revoke consent“ oben am jeweiligen Inhalt oder über die
              folgende Schaltfläche für die Zukunft widerrufen. Auf dieser Seite werden keine externen Medien geladen.
              Der Widerruf löscht nicht bereits bei Drittanbietern gespeicherte Daten und berührt nicht die
              Rechtmäßigkeit der vorherigen Verarbeitung.
            </p>
            <PrivacyControls />
          </section>

          <section>
            <h2>6. Externe Links</h2>
            <p>
              Social-Media-Profile, Merch-Shop, Ticketseiten und das externe Pressekit (z. B. Google Drive) sind normale
              Links. Erst beim Öffnen verlassen Sie unsere Website und es gelten die Hinweise des jeweiligen Betreibers.
              Die hier beschriebenen Einwilligungen ersetzen keine Einwilligung auf diesen externen Websites.
            </p>
          </section>

          <section>
            <h2>7. Empfänger und Übermittlungen außerhalb des EWR</h2>
            <p>
              Empfänger sind die oben genannten Hosting-, Inhalts-, Versand- und Postfachdienstleister sowie nach Ihrer
              Einwilligung die Medienanbieter. Soweit Dienstleister in unserem Auftrag handeln, ist ein Vertrag nach
              Art. 28 DSGVO erforderlich. Eine Einwilligung zum Laden externer Medien ersetzt nicht die Anforderungen
              für Drittlandübermittlungen nach Art. 44 ff. DSGVO.
            </p>
            <p className="whitespace-pre-line">
              {impressum?.internationalTransfers ||
                'Konkrete Empfänger, Drittländer und anwendbare Übermittlungsgarantien: noch nicht hinterlegt.'}
            </p>
            <p>
              Informationen und gegebenenfalls eine Kopie der anwendbaren Garantien erhalten Sie über den oben genannten
              Datenschutzkontakt.
            </p>
          </section>

          <section>
            <h2>8. Ihre Rechte</h2>
            <p>
              Unter den jeweiligen gesetzlichen Voraussetzungen haben Sie das Recht auf Auskunft (Art. 15), Berichtigung
              (Art. 16), Löschung (Art. 17), Einschränkung (Art. 18) und Datenübertragbarkeit (Art. 20 DSGVO).
              Einwilligungen können Sie jederzeit mit Wirkung für die Zukunft widerrufen (Art. 7 Abs. 3 DSGVO). Wenden
              Sie sich dafür an den oben genannten Datenschutzkontakt.
            </p>
            <h3>Widerspruchsrecht nach Art. 21 DSGVO</h3>
            <p>
              Bei einer Verarbeitung auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO können Sie aus Gründen, die sich aus
              Ihrer besonderen Situation ergeben, jederzeit widersprechen. Wir verarbeiten die Daten dann nicht weiter,
              es sei denn, wir weisen zwingende schutzwürdige Gründe nach, die Ihre Interessen, Rechte und Freiheiten
              überwiegen, oder die Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von
              Rechtsansprüchen. Gegen Direktwerbung können Sie jederzeit ohne Begründung widersprechen.
            </p>
            <p>
              Sie können sich nach Art. 77 DSGVO bei einer Datenschutz-Aufsichtsbehörde beschweren, insbesondere an
              Ihrem gewöhnlichen Aufenthaltsort, Arbeitsplatz oder dem Ort des vermuteten Verstoßes.
            </p>
            <p className="whitespace-pre-line">
              {impressum?.supervisoryAuthority || 'Zuständige Aufsichtsbehörde des Betreibers: noch nicht hinterlegt.'}
            </p>
          </section>

          <section>
            <h2>9. Automatisierte Entscheidungen und Änderungen</h2>
            <p>
              Wir nutzen auf dieser Website keine automatisierten Entscheidungen mit rechtlicher oder ähnlich
              erheblicher Wirkung im Sinne von Art. 22 DSGVO. Eigenständige Verarbeitungen externer Medienanbieter sind
              in deren Hinweisen beschrieben. Diese Erklärung ist bei Änderungen der Dienste oder Verarbeitungen
              anzupassen.
            </p>
            {impressum?.additionalPrivacyDetails && (
              <p className="whitespace-pre-line">{impressum.additionalPrivacyDetails}</p>
            )}
          </section>

          <p>
            <Link href="/impressum">Impressum</Link> · <Link href="/">Zurück zur Startseite</Link>
          </p>
        </div>
      </section>
    </BackgroundSurface>
  );
}
