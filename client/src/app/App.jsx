import { MotionConfig } from 'motion/react';
import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { MOTION } from '@/constants/motion';
import { ALL_PROVIDERS, PROVIDERS } from '@/constants/providers';
import { EXPLORER_TAB } from '@/constants/ui';
import { EndpointSearchBar } from '@/features/endpoints/components/EndpointSearchBar';
import { useCustomEndpoints } from '@/features/endpoints/hooks/useCustomEndpoints';
import { toGlobePins } from '@/features/endpoints/utils/endpointPins';
import { GlobeLegend } from '@/features/globe/components/GlobeLegend';
import { GlobeLoading } from '@/features/globe/components/GlobeLoading';
import { ProviderFilter } from '@/features/latency-test/components/ProviderFilter';
import { RunTestButton } from '@/features/latency-test/components/RunTestButton';
import { useLatencyTest } from '@/features/latency-test/hooks/useLatencyTest';
import { useRegionTargets } from '@/features/latency-test/hooks/useRegionTargets';
import {
  buildSortedRows,
  countTargetsByProvider,
  filterRowsByProvider,
  findFastestRow,
} from '@/features/latency-test/utils/results';
import { useUserLocation } from '@/features/location/hooks/useUserLocation';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { ExplorerPanel } from './layout/ExplorerPanel';
import { InsightsPanel } from './layout/InsightsPanel';
import { resolveSelection } from './selection';

// three.js is large, so the globe loads as its own chunk while the panels render.
const GlobeView = lazy(() =>
  import('@/features/globe/components/GlobeView').then((module) => ({ default: module.GlobeView })),
);

export function App() {
  const { targets } = useRegionTargets();
  const latencyTest = useLatencyTest();
  const customEndpoints = useCustomEndpoints();
  const userLocation = useUserLocation();

  const [providerFilter, setProviderFilter] = useState(ALL_PROVIDERS);
  const [selectedId, setSelectedId] = useState(null);
  const [explorerTab, setExplorerTab] = useState(EXPLORER_TAB.REGIONS);

  const allRows = useMemo(() => buildSortedRows(targets, latencyTest.results), [targets, latencyTest.results]);
  const visibleRows = useMemo(() => filterRowsByProvider(allRows, providerFilter), [allRows, providerFilter]);
  const providerCounts = useMemo(() => countTargetsByProvider(targets), [targets]);
  const endpointPins = useMemo(() => toGlobePins(customEndpoints.endpoints), [customEndpoints.endpoints]);
  const fastestRegionRow = findFastestRow(allRows);
  const selection = resolveSelection(selectedId, { rows: allRows, endpoints: customEndpoints.endpoints });

  const clearSelection = useCallback(() => setSelectedId(null), []);
  useEscapeKey(clearSelection);

  const { testEndpoint, stopEndpointTest, removeEndpoint } = customEndpoints;
  const startEndpointTest = useCallback(
    (endpoint) => {
      setSelectedId(testEndpoint(endpoint));
      setExplorerTab(EXPLORER_TAB.ENDPOINTS);
    },
    [testEndpoint],
  );
  const endpointActions = useMemo(
    () => ({
      testingIds: customEndpoints.testingIds,
      retest: startEndpointTest,
      stop: stopEndpointTest,
      remove: removeEndpoint,
    }),
    [customEndpoints.testingIds, startEndpointTest, stopEndpointTest, removeEndpoint],
  );
  const { testTarget, stopTarget } = latencyTest;
  const regionActions = useMemo(() => ({ test: testTarget, stop: stopTarget }), [testTarget, stopTarget]);

  const runRegionTest = () => latencyTest.startTest(visibleRows.map((row) => row.target));
  const fastestTitle =
    providerFilter === ALL_PROVIDERS ? 'Fastest overall' : `Fastest on ${PROVIDERS[providerFilter].label}`;

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
        <AppHeader
          search={
            <EndpointSearchBar
              isTesting={customEndpoints.isTesting}
              onTest={startEndpointTest}
              onStop={customEndpoints.stopAllEndpointTests}
            />
          }
          actions={
            <RunTestButton
              isRunning={latencyTest.isRunning}
              hasRun={latencyTest.hasRun}
              targetCount={visibleRows.length}
              onStart={runRegionTest}
              onStop={latencyTest.stopTest}
            />
          }
          toolbar={<ProviderFilter value={providerFilter} onChange={setProviderFilter} counts={providerCounts} />}
        />

        {/* Mobile: globe on top, panels stacked below. Desktop: panels float over a full-bleed globe. */}
        <main className="relative flex-1 lg:min-h-0">
          <section
            aria-label="Globe"
            className="relative h-[58vh] min-h-96 overflow-hidden lg:absolute lg:inset-0 lg:h-auto"
          >
            <Suspense fallback={<GlobeLoading />}>
              <GlobeView
                regionRows={visibleRows}
                endpointPins={endpointPins}
                userLocation={userLocation.location}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </Suspense>
            <GlobeLegend className="absolute bottom-6 left-[24rem] right-72 mx-auto w-fit max-lg:hidden" />
          </section>

          <div className="grid gap-4 p-4 lg:contents">
            <GlobeLegend className="lg:hidden" />
            <InsightsPanel
              selection={selection}
              selectionKey={selectedId}
              onClearSelection={clearSelection}
              onSelect={setSelectedId}
              fastestTitle={fastestTitle}
              visibleRows={visibleRows}
              allRows={allRows}
              fastestRegionRow={fastestRegionRow}
              testState={latencyTest}
              userLocation={userLocation}
              regionActions={regionActions}
              endpointActions={endpointActions}
              delay={MOTION.PANEL_STAGGER_SECONDS}
              className="lg:absolute lg:right-6 lg:top-6 lg:max-h-[calc(100%-16rem)] lg:w-80"
            />
            <ExplorerPanel
              activeTab={explorerTab}
              onTabChange={setExplorerTab}
              regionRows={visibleRows}
              endpoints={customEndpoints.endpoints}
              fastestRegionRow={fastestRegionRow}
              selectedId={selectedId}
              onSelect={setSelectedId}
              regionActions={regionActions}
              endpointActions={endpointActions}
              delay={MOTION.PANEL_STAGGER_SECONDS * 2}
              className="max-h-[75vh] lg:absolute lg:bottom-6 lg:left-6 lg:top-6 lg:max-h-none lg:w-[22rem]"
            />
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}
