import { LatencyStat } from '@/components/latency/LatencyStat';
import { CardHeader } from '@/components/ui/CardHeader';
import { ProviderBadge } from '@/components/ui/ProviderBadge';
import { PROVIDERS } from '@/constants/providers';

export function RegionDetailsCard({ target, result, onClose }) {
  const provider = PROVIDERS[target.provider];

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
      {target.isAnycastEdge && (
        <p className="rounded-lg bg-white/[0.03] px-3 py-2 text-xs leading-relaxed text-slate-400">
          Cloudflare is anycast: one IP is served from hundreds of cities, so this is the edge your traffic reaches (
          {target.code}), not a region you can choose.
        </p>
      )}
    </section>
  );
}
