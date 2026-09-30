const BASE_CLASSES =
  'shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const VARIANT_CLASSES = {
  primary: 'bg-sky-500 text-space-950 hover:bg-sky-400',
  secondary: 'border border-space-700 bg-space-800 text-slate-200 hover:bg-space-700',
};

export function Button({ variant = 'primary', type = 'button', className = '', ...buttonProps }) {
  return <button type={type} className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`} {...buttonProps} />;
}
