
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
  // ChatPage typically sets disablePadding to true to manage its own internal padding and layout.
  // Other pages use the default padding provided by PageWrapper.
  const paddingClasses = disablePadding ? '' : 'p-4 sm:p-6 lg:p-8';
  
  // PageWrapper now assumes it's filling the content area provided by <main> in index.tsx.
  // It provides background and conditional padding.
  // w-full and min-h-full ensure it attempts to fill the space given by the parent <main> which is flex-1.
  return (
    <div className={`${paddingClasses} bg-gray-100 dark:bg-gray-950 w-full min-h-full`}>
        {children}
    </div>
  );
};
