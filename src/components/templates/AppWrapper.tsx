import React, { ReactNode } from 'react';

import { Topbar, Sidebar } from '@components/organisms';

type Props = {
  children: ReactNode;
};

export default function AppWrapper({ children }: Props) {
  return (
    <div className="w-screen h-screen pr-5">
      <div className="flex h-full">
        <Sidebar />
        <div className="flex-1">
          <Topbar />
          {children}
        </div>
      </div>
    </div>
  );
}
