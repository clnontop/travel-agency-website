'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

interface ScrollTriggerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  scale?: number;
  opacity?: number;
  once?: boolean;
}

export default function ScrollTrigger({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  y = 50,
  scale = 1,
  opacity = 0,
  once = true,
}: ScrollTriggerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-100px' });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      });
    } else {
      controls.start({
        opacity,
        y,
        scale,
      });
    }
  }, [isInView, controls, delay, duration, y, scale, opacity]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial={{
        opacity,
        y,
        scale,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
