/** Small uppercase heading used at the top of panel sections. */
export function SectionLabel({ as: Tag = 'h2', children }) {
  return <Tag className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">{children}</Tag>;
}
