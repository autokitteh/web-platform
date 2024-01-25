import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

import { IButton } from '@components/atoms/buttons';
import { Button, Icon } from '@components/atoms';

interface IDropdownButton extends Partial<IButton> {
  iconLeft?: string | React.FC<React.SVGProps<SVGSVGElement>>;
  name: string;
}

export const DropdownButton = ({ iconLeft, name, children, disabled, ...rest }: IDropdownButton) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => setIsOpen(false), [location.pathname]);

  const toggleDropdown = () => setIsOpen(!isOpen);

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

  return (
    <div className="relative" ref={dropdownRef}>
      <Button onClick={toggleDropdown} {...rest} disabled={disabled}>
        {iconLeft && <Icon disabled={disabled} src={iconLeft} />}
        {name}
      </Button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="opened"
            exit="closed"
            variants={dropdownVariants}
            className="absolute left-1/2 !transform -translate-x-1/2 mt-2 p-2 bg-gray-600 text-black rounded-md shadow-xl z-50"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
