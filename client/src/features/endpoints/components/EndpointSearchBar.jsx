import { AnimatePresence, motion } from 'motion/react';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { GlobeIcon, StopIcon } from '@/components/ui/icons';
import { MOTION } from '@/constants/motion';
import { parseEndpointInput } from '../utils/parseEndpointInput';

/**
 * "Test your own endpoint" input. Enter always tests what's typed, so several endpoints can
 * run at once; while any test runs, the button becomes Stop and stops them all.
 */
export function EndpointSearchBar({ isTesting, onTest, onStop }) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    const parsed = parseEndpointInput(value);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setError(null);
    onTest(parsed);
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <label htmlFor={inputId} className="sr-only">
        Test your own endpoint
      </label>
      <div
        className={`flex h-11 items-center gap-2.5 rounded-xl border bg-white/[0.04] pl-3.5 pr-1.5 transition-colors focus-within:bg-white/[0.06] focus-within:ring-4 ${
          error
            ? 'border-rose-400/60 focus-within:ring-rose-400/10'
            : 'border-white/10 focus-within:border-sky-400/60 focus-within:ring-sky-400/10'
        }`}
      >
        <GlobeIcon className={`size-4 shrink-0 ${isTesting ? 'animate-spin text-sky-400' : 'text-slate-500'}`} />
        <input
          id={inputId}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError(null);
          }}
          placeholder="Test your own endpoint: api.example.com/health or https://…"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode="url"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
        />
        {/*
          Separate keys give Stop and Test separate <button> elements. Sharing one, a click on Stop would
          re-render it into the submit button mid-click, and the browser would then submit the form.
        */}
        {isTesting ? (
          <Button key="stop" type="button" variant="danger" size="sm" onClick={onStop}>
            <StopIcon className="size-3" />
            Stop
          </Button>
        ) : (
          <Button key="test" type="submit" size="sm">
            Test
          </Button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={MOTION.CARD_SWAP}
            className="absolute left-3 top-full z-10 mt-1.5 rounded-md bg-space-950/95 px-2 py-1 text-xs text-rose-300 shadow-lg"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
