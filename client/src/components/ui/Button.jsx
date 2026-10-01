const BASE_CLASSES =
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const VARIANT_CLASSES = {
  primary: 'bg-sky-500 text-space-950 shadow-[0_0_20px_rgba(14,165,233,0.35)] hover:bg-sky-400',
  secondary: 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
  danger: 'border border-rose-400/30 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25',
  ghost: 'text-slate-400 hover:bg-white/10 hover:text-white',
};

const SIZE_CLASSES = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  icon: 'size-9',
};

export function Button({ variant = 'primary', size = 'md', type = 'button', className = '', ...buttonProps }) {
  return (
    <button
      type={type}
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...buttonProps}
    />
  );
}
