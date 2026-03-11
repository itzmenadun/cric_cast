import React, { useEffect } from "react";
import { motion, useSpring, useTransform, animate } from "framer-motion";

/**
 * A Framer Motion component that smoothly interpolates between number values.
 * Perfect for score updates so the broadcast feels premium (like a slot machine rolling)
 * rather than hard-snapping from 14 to 18.
 */
export default function AnimatedNumber({ value, className, formatFn, duration = 0.5 }) {
  // We use a motion spring to handle the tweening of the number
  const springValue = useSpring(value, {
    stiffness: 100,
    damping: 20,
    mass: 1
  });

  // Whenever the incoming `value` prop changes, animate the spring to catch up
  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  // Hook into the spring's update cycle and format it (e.g., adding decimals or keeping it integer)
  const displayValue = useTransform(springValue, (current) => {
    if (formatFn) return formatFn(current);
    return Math.round(current); // Default strictly to integers (crucial for runs/wickets)
  });

  return (
    <motion.span className={className}>
      {displayValue}
    </motion.span>
  );
}
