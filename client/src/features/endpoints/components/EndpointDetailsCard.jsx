import { LatencyStat } from '@/components/latency/LatencyStat';
import { Button } from '@/components/ui/Button';
import { CardHeader } from '@/components/ui/CardHeader';
import { RefreshIcon, StopIcon, TrashIcon } from '@/components/ui/icons';
import { GLOBE_COLORS } from '@/constants/globe';
import { LOOKUP_STATUS } from '@/constants/customEndpoints';
import { PROVIDERS } from '@/constants/providers';
import { formatMs } from '@/utils/format';
import { compareWithFastestRegion } from '../utils/compareWithFastestRegion';

function Fact({ label, children }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-2 py-1.5 text-xs">
      <dt className="text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-slate-200">{children}</dd>
    </div>
  );
}

function LookupFacts({ lookup }) {
  if (!lookup || lookup.status === LOOKUP_STATUS.LOADING) {
    return <p className="animate-pulse py-2 text-xs text-slate-400">Locating server…</p>;
  }
  if (lookup.status === LOOKUP_STATUS.ERROR) {
    return <p className="py-2 text-xs text-rose-400">{lookup.error}</p>;
  }

  const { ip, city, country, organization, asn, isLikelyCdn } = lookup.data;
  return (
    <dl className="divide-y divide-white/5">
      <Fact label="IP address">
        <span className="font-mono">{ip}</span>
      </Fact>
      <Fact label="Location">{[city, country].filter(Boolean).join(', ')}</Fact>
      <Fact label="Network">
        {organization}
        {asn && <span className="ml-1.5 font-mono text-slate-500">AS{asn}</span>}
      </Fact>
      <Fact label="CDN">{isLikelyCdn ? 'Yes (anycast)' : 'Not detected'}</Fact>
    </dl>
  );
}

function CdnNote() {
  return (
    <p className="rounded-lg border border-amber-300/20 bg-amber-300/5 px-3 py-2 text-xs leading-relaxed text-amber-100/90">
      This endpoint sits behind a CDN, so you're reaching the CDN's nearest edge, not the origin server. The location
      above is where the network is registered, not necessarily where your request was answered.
    </p>
  );
}

function Comparison({ comparison }) {
  const { endpointMs, region, regionMs, savingsMs, isWorthMoving } = comparison;
  return (
    <div className="rounded-lg bg-white/[0.03] px-3 py-2.5 text-xs leading-relaxed">
      <p className="text-slate-300">
        Your endpoint: <span className="font-mono text-white">{formatMs(endpointMs)}</span>
        <span className="mx-1.5 text-slate-600">·</span>
        Fastest region for you: {PROVIDERS[region.provider].label} {region.city}{' '}
        <span className="font-mono text-white">{formatMs(regionMs)}</span>
      </p>
      <p className={`mt-1 ${isWorthMoving ? 'text-sky-300' : 'text-emerald-300'}`}>
        {isWorthMoving
          ? `Moving closer to your users could cut latency by ~${formatMs(savingsMs)}.`
          : 'Your endpoint is about as fast as the best cloud region from here.'}
      </p>
    </div>
  );
}

/** Everything known about one custom endpoint, compared with the fastest region. */
export function EndpointDetailsCard({ endpoint, fastestRegionRow, isTesting, onStop, onRetest, onRemove, onClose }) {
  const comparison = compareWithFastestRegion(endpoint.result, fastestRegionRow);
  const isLikelyCdn = endpoint.lookup?.data?.isLikelyCdn;

  return (
    <section className="space-y-4">
      <CardHeader
        eyebrow={
          <>
            <span className="size-2.5 rotate-45 rounded-[2px]" style={{ backgroundColor: GLOBE_COLORS.endpoint }} />
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">Your endpoint</span>
          </>
        }
        title={endpoint.hostname}
        subtitle={endpoint.url}
        onClose={onClose}
      />
      <div className="space-y-2">
        <LatencyStat result={endpoint.result} caption="ms response" />
        <p className="text-[11px] leading-relaxed text-slate-500">
          Includes the server's processing time, since every request bypasses caches. For a cleaner network reading,
          test a lightweight path such as <span className="font-mono text-slate-400">/health</span>.
        </p>
      </div>
      <LookupFacts lookup={endpoint.lookup} />
      {isLikelyCdn && <CdnNote />}
      {comparison ? (
        <Comparison comparison={comparison} />
      ) : (
        <p className="text-xs text-slate-500">Run the region test to compare with the fastest cloud region.</p>
      )}
      <div className="flex gap-2">
        {isTesting ? (
          <Button variant="danger" size="sm" onClick={onStop}>
            <StopIcon className="size-3" />
            Stop
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={onRetest}>
            <RefreshIcon className="size-3.5" />
            Re-test
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onRemove}>
          <TrashIcon className="size-3.5" />
          Remove
        </Button>
      </div>
    </section>
  );
}
