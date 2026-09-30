import { PROVIDERS } from '@/constants/providers';
import { PROVIDER_BADGE_BACKGROUND_OPACITY, PROVIDER_BADGE_BORDER_OPACITY } from '@/constants/ui';
import { withOpacity } from '@/utils/color';

export function ProviderBadge({ providerId }) {
  const { label, color } = PROVIDERS[providerId];

  return (
    <span
      className="inline-block rounded border px-1.5 py-0.5 text-[11px] font-semibold tracking-wide"
      style={{
        color,
        borderColor: withOpacity(color, PROVIDER_BADGE_BORDER_OPACITY),
        backgroundColor: withOpacity(color, PROVIDER_BADGE_BACKGROUND_OPACITY),
      }}
    >
      {label}
    </span>
  );
}
