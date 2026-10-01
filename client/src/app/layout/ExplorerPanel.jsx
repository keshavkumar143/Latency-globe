import { Panel } from '@/components/ui/Panel';
import { Tabs } from '@/components/ui/Tabs';
import { EXPLORER_TAB } from '@/constants/ui';
import { EndpointList } from '@/features/endpoints/components/EndpointList';
import { MethodologyNote } from '@/features/latency-test/components/MethodologyNote';
import { RegionResultsList } from '@/features/latency-test/components/RegionResultsList';

/** Left panel: region results and the user's own endpoints, as tabs. */
export function ExplorerPanel({
  activeTab,
  onTabChange,
  regionRows,
  endpoints,
  fastestRegionRow,
  selectedId,
  onSelect,
  onRemoveEndpoint,
  className = '',
  delay,
}) {
  const tabs = [
    { id: EXPLORER_TAB.REGIONS, label: 'Regions', count: regionRows.length },
    { id: EXPLORER_TAB.ENDPOINTS, label: 'Your endpoints', count: endpoints.length },
  ];

  return (
    <Panel enterFrom="left" delay={delay} aria-label="Explorer" className={`flex flex-col ${className}`}>
      <div className="p-3">
        <Tabs tabs={tabs} activeId={activeTab} onChange={onTabChange} layoutId="explorer-tab-highlight" />
      </div>

      {activeTab === EXPLORER_TAB.REGIONS ? (
        <RegionResultsList rows={regionRows} selectedId={selectedId} onSelect={onSelect} />
      ) : (
        <EndpointList
          endpoints={endpoints}
          fastestRegionRow={fastestRegionRow}
          selectedId={selectedId}
          onSelect={onSelect}
          onRemove={onRemoveEndpoint}
        />
      )}

      <footer className="border-t border-white/5 px-4 py-3">
        <MethodologyNote />
      </footer>
    </Panel>
  );
}
