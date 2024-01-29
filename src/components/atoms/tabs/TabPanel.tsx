import React, { useContext } from 'react';
import { cn } from '@utils';

import { TabsContext } from '@components/atoms/tabs/TabsContext';

interface ITabPanel {
  className?: string;
  value: string | number;
  children: React.ReactNode;
}

export const TabPanel = ({ className, value, children }: ITabPanel) => {
  const { activeTab } = useContext(TabsContext);

  if (value !== activeTab) return null;

  return <div className={cn(className)}>{children}</div>;
};
