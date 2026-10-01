import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useEffect } from 'react';
import { MOTION } from '@/constants/motion';

/** A whole number that counts to each new value instead of jumping. */
export function AnimatedNumber({ value, className, style }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      motionValue.set(value);
      return undefined;
    }
    const animation = animate(motionValue, value, MOTION.NUMBER_TWEEN);
    return () => animation.stop();
  }, [motionValue, value, shouldReduceMotion]);

  return (
    <motion.span className={className} style={style}>
      {rounded}
    </motion.span>
  );
}
