import React from 'react';
import clsx from 'clsx';

interface IBadge {
  text: string;
  className?: string;
}

export default function Badge({ text, className }: IBadge) {
  const badgeClasses = clsx(
    'inline-block px-1 py-0.5 text-xs font-bold bg-red-500 text-black leading-none text-center align-baseline whitespace-nowrap rounded-full',
    className,
  );

  return <span className={badgeClasses}>{text}</span>;
}
