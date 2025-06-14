import React from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface PageWrapperProps {
  children: React.ReactNode;
  disablePadding?: boolean; // New prop
}

export const PageWrapper: React.FC<PageWrapperProps> = (props) => {
  const { children, disablePadding } = props;
  const { lang } = useAppContext(); // isSidebarOpen removed as margin handled by main

  const paddingClasses = disablePadding ? '' : 'p-4 sm:p-6 md:p-8';
  
  // PageWrapper is now primarily for consistent padding and background for standard pages.
  // The main element in index.tsx handles the flex-1, overflow-y-auto, and sidebar margins.
  // Added w-full and h-full to ensure it fills the space given by the parent main tag.
  return (
    <div className={`${paddingClasses} bg-slate-100 dark:bg-slate-900 w-full h-full`}>
        {children}
    </div>
  );
};