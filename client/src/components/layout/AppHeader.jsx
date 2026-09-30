import { APP_NAME, APP_TAGLINE } from '@/constants/app';

/** @param {{ actions?: import('react').ReactNode }} props */
export function AppHeader({ actions }) {
  return (
    <header className="border-b border-space-700 bg-space-900/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">{APP_NAME}</h1>
          <p className="text-sm text-slate-400">{APP_TAGLINE}</p>
        </div>
        {actions}
      </div>
    </header>
  );
}
