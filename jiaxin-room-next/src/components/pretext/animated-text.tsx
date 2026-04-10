"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  animation?: "bounce" | "fade" | "typewriter" | "wave";
}

const bounceVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: {
      delay: i * 0.06,
      type: "spring",
      damping: 12,
      stiffness: 200,
    },
  }),
};

const fadeVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const waveVariants: Variants = {
  hidden: { opacity: 0, y: 0 },
  visible: (i: number) => ({
    opacity: 1,
    y: [0, -12, 0],
    transition: {
      delay: i * 0.08,
      duration: 0.6,
      ease: "easeInOut",
    },
  }),
};

const variantMap = {
  bounce: bounceVariants,
  fade: fadeVariants,
  typewriter: fadeVariants,
  wave: waveVariants,
};

export function AnimatedText({
  text,
  className = "",
  delay = 0,
  animation = "bounce",
}: AnimatedTextProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const chars = text.split("");
  const variants = variantMap[animation];

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`} aria-label={text}>
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          custom={i + delay}
          variants={variants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className={char === " " ? "w-[0.3em]" : ""}
          aria-hidden
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}
