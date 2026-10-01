import { Button } from './Button';
import { CloseIcon } from './icons';

/** Title row for detail cards, with an optional close button. */
export function CardHeader({ eyebrow, title, subtitle, onClose }) {
  return (
    <div className="flex items-start gap-3">
      <div className="min-w-0 flex-1">
        {eyebrow && <div className="mb-1.5 flex items-center gap-2">{eyebrow}</div>}
        <h3 className="truncate text-lg font-semibold leading-tight text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 truncate text-xs text-slate-400">{subtitle}</p>}
      </div>
      {onClose && (
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close details" className="-mr-2 -mt-1">
          <CloseIcon />
        </Button>
      )}
    </div>
  );
}
