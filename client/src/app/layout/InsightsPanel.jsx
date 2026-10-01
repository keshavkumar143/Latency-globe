import { AnimatePresence, motion } from 'motion/react';
import { Panel } from '@/components/ui/Panel';
import { MARKER_KIND } from '@/constants/globe';
import { MOTION } from '@/constants/motion';
import { EndpointDetailsCard } from '@/features/endpoints/components/EndpointDetailsCard';
import { BestByProvider } from '@/features/latency-test/components/BestByProvider';
import { FastestResultCard } from '@/features/latency-test/components/FastestResultCard';
import { RegionDetailsCard } from '@/features/latency-test/components/RegionDetailsCard';
import { TestProgress } from '@/features/latency-test/components/TestProgress';
import { UserLocationCard } from '@/features/location/components/UserLocationCard';

function SelectionDetails({ selection, fastestRegionRow, endpointActions, onClose }) {
  switch (selection.kind) {
    case MARKER_KIND.REGION:
      return <RegionDetailsCard target={selection.row.target} result={selection.row.result} onClose={onClose} />;
    case MARKER_KIND.ENDPOINT: {
      const { endpoint } = selection;
      return (
        <EndpointDetailsCard
          endpoint={endpoint}
          fastestRegionRow={fastestRegionRow}
          isTesting={endpointActions.isTesting}
          onRetest={() => endpointActions.retest(endpoint)}
          onRemove={() => endpointActions.remove(endpoint.id)}
          onClose={onClose}
        />
      );
    }
    default:
      return null;
  }
}

/** Right panel: whatever is selected, then the headline numbers, progress and location. */
export function InsightsPanel({
  selection,
  selectionKey,
  onClearSelection,
  onSelect,
  fastestTitle,
  visibleRows,
  allRows,
  fastestRegionRow,
  testState,
  userLocation,
  endpointActions,
  className = '',
  delay,
}) {
  const hasSelectionCard = selection && selection.kind !== MARKER_KIND.USER;

  return (
    <Panel
      enterFrom="right"
      delay={delay}
      aria-label="Insights"
      className={`divide-y divide-white/5 overflow-y-auto [&>*]:p-5 ${className}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {hasSelectionCard && (
          <motion.div
            key={selectionKey}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={MOTION.CARD_SWAP}
            className="bg-white/[0.02]"
          >
            <SelectionDetails
              selection={selection}
              fastestRegionRow={fastestRegionRow}
              endpointActions={endpointActions}
              onClose={onClearSelection}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-5">
        <FastestResultCard title={fastestTitle} rows={visibleRows} onSelect={onSelect} />
        <BestByProvider rows={allRows} onSelect={onSelect} />
      </div>
      <TestProgress rows={visibleRows} isRunning={testState.isRunning} hasRun={testState.hasRun} />
      <UserLocationCard
        location={userLocation.location}
        status={userLocation.status}
        preciseError={userLocation.preciseError}
        onRequestPrecise={userLocation.requestPreciseLocation}
      />
    </Panel>
  );
}
