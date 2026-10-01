import { GLOBE_COLORS } from '@/constants/globe';
import { LATENCY_BANDS } from '@/constants/latency';
import { PROVIDERS } from '@/constants/providers';

function LegendItem({ swatch, label }) {
  return (
    <li className="flex items-center gap-1.5 whitespace-nowrap">
      {swatch}
      <span>{label}</span>
    </li>
  );
}

const dot = (color) => <span className="size-2 rounded-full" style={{ backgroundColor: color }} />;
const line = (color) => <span className="h-0.5 w-3.5 rounded-full" style={{ backgroundColor: color }} />;

export function GlobeLegend({ className = '' }) {
  return (
    <ul
      aria-label="Legend"
      className={`pointer-events-none flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 rounded-xl border border-white/10 bg-space-950/70 px-3.5 py-2 text-[11px] text-slate-300 shadow-xl shadow-black/40 backdrop-blur-md ${className}`}
    >
      <LegendItem swatch={<span className="size-2 rounded-full bg-white shadow-[0_0_6px_white]" />} label="You" />
      <LegendItem
        swatch={<span className="size-2 rotate-45 rounded-[2px]" style={{ backgroundColor: GLOBE_COLORS.endpoint }} />}
        label="Your endpoint"
      />
      {Object.values(PROVIDERS).map((provider) => (
        <LegendItem key={provider.id} swatch={dot(provider.color)} label={provider.label} />
      ))}
      <li aria-hidden="true" className="h-3 w-px bg-white/15" />
      {Object.values(LATENCY_BANDS).map((band) => (
        <LegendItem key={band.id} swatch={line(band.color)} label={band.label} />
      ))}
    </ul>
  );
}
