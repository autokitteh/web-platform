import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@utils';

interface IDropdownMenu {
  isOpen: boolean;
  className?: string;
  children: React.ReactNode;
}

export const DropdownMenu = ({ isOpen, className, children }: IDropdownMenu) => {
  const dropdownVariants = {
    opened: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
    closed: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3 },
    },
  };

  const menuStyle = cn(
    'absolute left-1/2 !transform -translate-x-1/2 mt-2 p-2.5 bg-black rounded-lg border border-gray-500 shadow-xl z-50',
    className,
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial="closed" animate="opened" exit="closed" variants={dropdownVariants} className={menuStyle}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
