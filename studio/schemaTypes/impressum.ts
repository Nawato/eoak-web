import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'impressum',
  title: 'Impressum & Datenschutz',
  type: 'document',
  groups: [
    { name: 'operator', title: 'Verantwortlicher', default: true },
    { name: 'legal', title: 'Impressum' },
    { name: 'privacy', title: 'Datenschutz' },
  ],
  fields: [
    defineField({
      name: 'legalNotice',
      type: 'string',
      hidden: true,
      readOnly: true,
      deprecated: { reason: 'Die Website verwendet automatisch § 5 DDG statt des früheren TMG.' },
    }),
    defineField({
      name: 'operatorName',
      title: 'Vollständiger Name des Betreibers',
      group: 'operator',
      type: 'string',
      description:
        'Verantwortliche natürliche Person oder vollständiger rechtlicher Unternehmensname; nicht nur der Bandname.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'operatorAddress',
      title: 'Ladungsfähige Anschrift',
      group: 'operator',
      type: 'text',
      rows: 4,
      description: 'Straße, Hausnummer, Postleitzahl, Ort und Land. Kein Postfach und keine Musteradresse.',
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            value && /musterstra(?:ß|ss)e|12345 berlin/i.test(value)
              ? 'Bitte die tatsächliche ladungsfähige Anschrift eintragen.'
              : true,
          ),
    }),
    defineField({
      name: 'email',
      title: 'Kontakt-E-Mail',
      group: 'operator',
      type: 'email',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'phone',
      title: 'Telefon',
      group: 'operator',
      type: 'string',
      description: 'Tatsächliche Telefonnummer für unmittelbaren Kontakt, sofern angegeben.',
    }),
    defineField({
      name: 'representedBy',
      title: 'Vertretungsberechtigte Personen',
      group: 'operator',
      type: 'string',
      description:
        'Bei Gesellschaften die vollständigen Namen der Vertretungsberechtigten; nicht „Booking & Management“.',
      validation: (rule) =>
        rule.custom((value) =>
          value === 'Booking & Management' ? 'Bitte vollständige Namen eintragen oder das Feld leeren.' : true,
        ),
    }),
    defineField({
      name: 'legalForm',
      title: 'Rechtsform',
      group: 'legal',
      type: 'string',
      description: 'Falls zutreffend, z. B. GbR oder GmbH. Nicht raten.',
    }),
    defineField({
      name: 'registerDetails',
      title: 'Registerangaben',
      group: 'legal',
      type: 'text',
      rows: 3,
      description: 'Falls eingetragen: Registerart, Registergericht und Registernummer.',
    }),
    defineField({
      name: 'vatId',
      title: 'Umsatzsteuer-Identifikationsnummer',
      group: 'legal',
      type: 'string',
      description: 'Nur falls vorhanden (§ 27a UStG). Keine private Steuernummer veröffentlichen.',
    }),
    defineField({
      name: 'businessId',
      title: 'Wirtschafts-Identifikationsnummer',
      group: 'legal',
      type: 'string',
      description: 'Nur falls vorhanden (§ 139c AO).',
    }),
    defineField({
      name: 'editorialResponsible',
      title: 'Verantwortlich nach § 18 Abs. 2 MStV',
      group: 'legal',
      type: 'text',
      rows: 4,
      description: 'Nur bei journalistisch-redaktionellen Angeboten: vollständiger Name und Anschrift.',
    }),
    defineField({
      name: 'disputeResolution',
      title: 'Verbraucherstreitbeilegung',
      group: 'legal',
      type: 'text',
      description:
        'Sofern § 36 VSBG anwendbar: tatsächliche Teilnahmebereitschaft/-pflicht; ggf. Name, Anschrift und Website der Schlichtungsstelle. Keine veraltete EU-OS-Plattform verlinken.',
    }),
    defineField({
      name: 'additionalLegalDetails',
      title: 'Weitere Pflichtangaben',
      group: 'legal',
      type: 'text',
      description: 'Falls einschlägig: Aufsichtsbehörde, berufsrechtliche Angaben oder Liquidationshinweis.',
    }),
    defineField({
      name: 'hostingDetails',
      title: 'Hosting-Anbieter und Server-Logdaten',
      group: 'privacy',
      type: 'text',
      description:
        'Vollständiger Anbietername, Anschrift, Verarbeitungsorte, Datenschutz-URL, konkrete Log-Speicherdauer oder Löschkriterien. Tatsächliche Server-/Proxy-Konfiguration prüfen.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'emailProcessingDetails',
      title: 'E-Mail-Dienstleister und Speicherfristen',
      group: 'privacy',
      type: 'text',
      description:
        'Tatsächlichen Postfachanbieter und Resend-Vertragspartner, Anschriften/Datenschutz-URLs, Verarbeitungsorte und Löschfristen für Versandprotokolle und Nachrichten angeben. Gesetzliche Aufbewahrungspflichten berücksichtigen.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'internationalTransfers',
      title: 'Drittlandübermittlungen und Garantien',
      group: 'privacy',
      type: 'text',
      description:
        'Für Hosting, Sanity, Resend/Postfach und Medienanbieter konkret prüfen: Empfänger/Länder, tatsächlich anwendbarer Angemessenheitsbeschluss (Art. 45) oder Garantien (Art. 46 DSGVO, z. B. SCC) und Bezugsquelle für Kopien. Keine ungeprüfte DPF-Zertifizierung behaupten.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'supervisoryAuthority',
      title: 'Datenschutz-Aufsichtsbehörde',
      group: 'privacy',
      type: 'text',
      description: 'Für den Verantwortlichen zuständige Behörde mit Anschrift und Website.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'dataProtectionOfficer',
      title: 'Datenschutzbeauftragter',
      group: 'privacy',
      type: 'text',
      description: 'Nur falls benannt: Kontaktdaten des Datenschutzbeauftragten.',
    }),
    defineField({
      name: 'additionalPrivacyDetails',
      title: 'Zusätzliche Datenschutzhinweise',
      group: 'privacy',
      type: 'text',
      description:
        'Weitere tatsächliche Verarbeitungen oder vertragsspezifische Details. Neue Dienste auch im Website-Code berücksichtigen.',
    }),
  ],
});
