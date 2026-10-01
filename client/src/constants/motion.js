/** Shared animation settings for UI motion (globe camera motion lives in constants/globe.js). */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

export const MOTION = Object.freeze({
  PANEL_ENTER: Object.freeze({ duration: 0.7, ease: EASE_OUT_EXPO }),
  PANEL_ENTER_OFFSET_PX: 24,
  PANEL_STAGGER_SECONDS: 0.12,
  LIST_REORDER: Object.freeze({ type: 'spring', stiffness: 520, damping: 42, mass: 0.8 }),
  BAR_GROW: Object.freeze({ duration: 0.6, ease: EASE_OUT_EXPO }),
  NUMBER_TWEEN: Object.freeze({ duration: 0.9, ease: EASE_OUT_EXPO }),
  POP_IN: Object.freeze({ type: 'spring', stiffness: 420, damping: 28 }),
  CARD_SWAP: Object.freeze({ duration: 0.25, ease: EASE_OUT_EXPO }),
  /** Ripple when a marker's result arrives. */
  MARKER_ARRIVAL: Object.freeze({ duration: 1.2, ease: 'easeOut' }),
  MARKER_ARRIVAL_SCALE: 3,
});
