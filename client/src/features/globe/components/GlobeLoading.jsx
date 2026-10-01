/** Placeholder while the globe's code (three.js) downloads. */
export function GlobeLoading() {
  return (
    <div className="absolute inset-0 grid place-items-center" role="status">
      <div className="size-48 animate-pulse rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(59,130,246,0.35),rgba(11,23,51,0.9)_60%,transparent_72%)] shadow-[0_0_80px_10px_rgba(59,130,246,0.15)]" />
      <span className="sr-only">Loading globe…</span>
    </div>
  );
}
