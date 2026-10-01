import { LogoMark } from '@/components/ui/LogoMark';
import { Wordmark } from '@/components/ui/Wordmark';
import { APP_NAME, APP_TAGLINE } from '@/constants/app';

/**
 * Top bar. Desktop: brand · search · actions on one row. Mobile: brand and actions on top,
 * search full-width below. `toolbar` gets its own row underneath.
 */
export function AppHeader({ search, actions, toolbar }) {
  return (
    <header className="relative z-20 border-b border-white/[0.06] bg-space-950/80 backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 pt-3 lg:flex-nowrap lg:px-6">
        <div className="order-1 flex shrink-0 items-center gap-3">
          <LogoMark className="size-10" />
          <div>
            <h1 className="leading-none">
              <span className="sr-only">{APP_NAME}</span>
              <Wordmark className="text-lg" />
            </h1>
            <p className="hidden text-[11px] text-slate-400 xl:block">{APP_TAGLINE}</p>
          </div>
        </div>
        <div className="order-3 w-full lg:order-2 lg:mx-auto lg:max-w-2xl">{search}</div>
        <div className="order-2 ml-auto lg:order-3 lg:ml-0">{actions}</div>
      </div>
      <div className="px-3 py-2 lg:px-5">{toolbar}</div>
    </header>
  );
}
