import ConsentSettingsForm from './ConsentSettingsForm';

export default function PrivacyControls() {
  return (
    <div className="mt-4 rounded-sm border border-white/10 bg-white/[0.02] p-4" lang="de">
      <ConsentSettingsForm variant="inline" />
    </div>
  );
}
