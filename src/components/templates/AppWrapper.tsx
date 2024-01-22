import React, { ReactNode } from 'react';
import clsx from 'clsx';

type Props = {
  children: ReactNode;
  classes?: string[];
};

export default function AppWrapper({ children, classes }: Props) {
  const baseClass = ['bg-white'];
  const wrapperClass = clsx(baseClass, classes);

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className={wrapperClass}>{children}</div>
    </div>
  );
}
