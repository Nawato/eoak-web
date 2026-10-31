import { defineType } from 'sanity';

export default defineType({
  name: 'impressum',
  title: 'Impressum',
  type: 'document',
  fields: [
    {
      name: 'legalNotice',
      title: 'Legal Notice (§)',
      type: 'string',
      description: 'e.g. "Angaben gemäß § 5 TMG"',
      initialValue: 'Angaben gemäß § 5 TMG',
    },
    {
      name: 'operatorName',
      title: 'Operator / Band Name',
      type: 'string',
      initialValue: 'End Of All Known',
    },
    {
      name: 'operatorAddress',
      title: 'Operator Address',
      type: 'string',
      initialValue: 'Musterstraße 1, 12345 Berlin, Germany',
    },
    {
      name: 'email',
      title: 'Email',
      type: 'email',
      initialValue: 'booking@endofallknown.de',
    },
    {
      name: 'phone',
      title: 'Phone',
      type: 'string',
      initialValue: '+49 (0) 30 000000',
    },
    {
      name: 'representedBy',
      title: 'Represented By',
      type: 'string',
      initialValue: 'Booking & Management',
    },
  ],
});
