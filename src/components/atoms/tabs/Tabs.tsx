import React, { useState } from 'react';
import { cn } from '@utils';

import { TabsContext } from '@components/atoms/tabs/TabsContext';

interface ITabs {
  className?: string;
  children: React.ReactNode;
}

export const Tabs = ({ className, children }: ITabs) => {
  const [activeTab, setActiveTab] = useState<string | number>(0);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn(className)}>{children}</div>
    </TabsContext.Provider>
  );
};
