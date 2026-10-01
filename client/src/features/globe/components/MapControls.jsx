import { Button } from '@/components/ui/Button';
import { CrosshairIcon, MinusIcon, PlusIcon } from '@/components/ui/icons';
import { MAP_STYLES } from '@/constants/mapStyles';

const GLASS_CLASSES = 'rounded-xl border border-white/10 bg-space-950/70 shadow-xl shadow-black/40 backdrop-blur-md';

export function MapStyleSwitcher({ activeStyleId, onChange }) {
  return (
    <div role="radiogroup" aria-label="Map style" className={`flex gap-0.5 p-1 ${GLASS_CLASSES}`}>
      {Object.values(MAP_STYLES).map((style) => {
        const isActive = style.id === activeStyleId;
        return (
          <button
            key={style.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(style.id)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
              isActive ? 'bg-white/15 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            {style.label}
          </button>
        );
      })}
    </div>
  );
}

/** Zoom and fly-home buttons. */
export function ZoomControls({ onZoomIn, onZoomOut, onHome }) {
  return (
    <div className={`flex flex-col p-1 ${GLASS_CLASSES}`}>
      <Button variant="ghost" size="icon" onClick={onZoomIn} aria-label="Zoom in" title="Zoom in">
        <PlusIcon />
      </Button>
      <Button variant="ghost" size="icon" onClick={onZoomOut} aria-label="Zoom out" title="Zoom out">
        <MinusIcon />
      </Button>
      <div className="mx-2 my-0.5 h-px bg-white/10" />
      <Button variant="ghost" size="icon" onClick={onHome} aria-label="Fly to my location" title="Fly to my location">
        <CrosshairIcon />
      </Button>
    </div>
  );
}
