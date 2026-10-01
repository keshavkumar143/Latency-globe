import { motion } from 'motion/react';
import { MOTION } from '@/constants/motion';

const ENTER_OFFSET = {
  left: { x: -MOTION.PANEL_ENTER_OFFSET_PX },
  right: { x: MOTION.PANEL_ENTER_OFFSET_PX },
  bottom: { y: MOTION.PANEL_ENTER_OFFSET_PX },
};

/** Frosted-glass card that floats over the globe and slides in on mount. */
export function Panel({ enterFrom = 'bottom', delay = 0, className = '', children, ...sectionProps }) {
  return (
    <motion.section
      initial={{ opacity: 0, ...ENTER_OFFSET[enterFrom] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ ...MOTION.PANEL_ENTER, delay }}
      className={`rounded-2xl border border-white/10 bg-space-900/85 shadow-2xl shadow-black/50 backdrop-blur-xl ${className}`}
      {...sectionProps}
    >
      {children}
    </motion.section>
  );
}
