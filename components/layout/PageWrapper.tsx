
import React from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface PageWrapperProps {
  children: React.ReactNode;
  disablePadding?: boolean; 
}

export const PageWrapper: React.FC<PageWrapperProps> = (props) => {
  const { children, disablePadding } = props;
  const { lang } = useAppContext();

  // Padding classes are applied unless disablePadding is true.
  // Uses 8px grid: p-4 (16px), sm:p-6 (24px), lg:p-8 (32px)
  const paddingClasses = disablePadding ? '' : 'p-4 sm:p-6 lg:p-8';
  
  // PageWrapper now assumes it's filling the content area provided by <main> in index.tsx.
  // It provides background and conditional padding.
  // w-full and min-h-full ensure it attempts to fill the space given by the parent <main> which is flex-1.
  return (
    <div className={`${paddingClasses} bg-[var(--bg-primary)] w-full min-h-full`}>
        {children}
    </div>
  );
};
