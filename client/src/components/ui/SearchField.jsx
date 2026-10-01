import { SearchIcon } from './icons';

/** Compact filter input with a search icon. */
export function SearchField({ value, onChange, placeholder, label }) {
  return (
    <label className="flex h-8 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 text-slate-500 focus-within:border-sky-400/50 focus-within:text-slate-300">
      <SearchIcon className="size-3.5 shrink-0" />
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
      />
    </label>
  );
}
