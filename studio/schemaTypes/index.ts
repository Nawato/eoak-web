import siteSettings from './siteSettings';
import pressKit from './pressKit';
import impressum from './impressum';
import release from './release';
import member from './member';
import show from './show';
import photo from './photo';
import video from './video';
import { releaseAnalyticsTypes } from './releaseAnalytics';

export const schemaTypes = [
  siteSettings,
  pressKit,
  impressum,
  release,
  member,
  show,
  photo,
  video,
  ...releaseAnalyticsTypes,
];
