import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { MenuItem, ISubmenu } from '@components/molecules/menu';

export const Submenu = ({ submenuInfo, isOpen }: ISubmenu) => {
  const submenuVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  };

  return (
    <motion.div
      className="w-auto h-screen bg-gray-200 border-l border-r border-gray-300 mr-2.5 z-1"
      style={{ paddingTop: submenuInfo.top }}
      variants={submenuVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {submenuInfo.submenu?.map(({ name, href, id }) => (
        <Link key={id} to={href} className="block px-3">
          <MenuItem name={name} isOpen={isOpen} className="px-4" />
        </Link>
      ))}
    </motion.div>
  );
};
