"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const variants = {
  hidden: { opacity: 0, y: 15 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
};

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const transitionKey = pathname.startsWith('/auth/member') ? '/auth/member' : pathname;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={transitionKey}
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: "opacity, transform" }}
        className="flex-grow flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
