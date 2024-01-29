import React, { useContext } from 'react';
import { cn } from '@utils';
import { TabsContext } from '@components/atoms/tabs/TabsContext';

interface ITab {
  className?: string;
  value: string | number;
  children: React.ReactNode;
}

export const Tab = ({ className, value, children }: ITab) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);

  const tabStyle = cn(
    'border-b-2 cursor-pointer hover:font-bold border-transparent',
    {
      'border-white font-bold': activeTab === value,
    },
    className,
  );

  const handleActive = () => setActiveTab(value);

  return (
    <div className={tabStyle} onClick={handleActive}>
      {children}
    </div>
  );
};
