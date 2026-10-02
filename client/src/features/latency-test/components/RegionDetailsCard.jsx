import { LatencyStat } from '@/components/latency/LatencyStat';
import { Button } from '@/components/ui/Button';
import { CardHeader } from '@/components/ui/CardHeader';
import { RefreshIcon, StopIcon } from '@/components/ui/icons';
import { ProviderBadge } from '@/components/ui/ProviderBadge';
import { PROVIDERS } from '@/constants/providers';
import { IN_PROGRESS_STATUSES, TEST_STATUS } from '@/constants/testStatus';
import { hasValidCoordinates } from '@/utils/geo';

function AnycastNote({ target }) {
  return (
    <p className="rounded-lg bg-white/[0.03] px-3 py-2 text-xs leading-relaxed text-slate-400">
      {hasValidCoordinates(target)
        ? `Cloudflare is anycast: one IP is served from hundreds of cities, so this is the edge your traffic reaches (${target.code}), not a region you can choose.`
        : "Cloudflare is anycast, so you always reach your nearest edge. Your browser blocked the lookup that names it (privacy extensions often do), so it isn't on the globe, but its latency is still measured."}
    </p>
  );
}

export function RegionDetailsCard({ target, result, onStop, onTest, onClose }) {
  const provider = PROVIDERS[target.provider];
  const isMeasuring = IN_PROGRESS_STATUSES.includes(result.status);

  return (
    <section className="space-y-4">
      <CardHeader
        eyebrow={
          <>
            <ProviderBadge providerId={target.provider} />
            <span className="font-mono text-xs text-slate-400">{target.code}</span>
          </>
        }
        title={target.city}
        subtitle={provider.name}
        onClose={onClose}
      />
      <LatencyStat result={result} />
      {target.isAnycastEdge && <AnycastNote target={target} />}
      <div className="flex gap-2">
        {isMeasuring ? (
          <Button variant="danger" size="sm" onClick={() => onStop(target.id)}>
            <StopIcon className="size-3" />
            Stop
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => onTest(target)}>
            <RefreshIcon className="size-3.5" />
            {result.status === TEST_STATUS.IDLE ? 'Test this region' : 'Re-test'}
          </Button>
        )}
      </div>
    </section>
  );
}
