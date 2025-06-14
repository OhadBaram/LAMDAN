
import React from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface PageWrapperProps {
  children: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = (props) => {
  const { children } = props;
  const { lang, isSidebarOpen } = useAppContext();

  return (
    <div className={`p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 ${isSidebarOpen && lang !== 'he' ? 'md:ml-60' : ''} ${isSidebarOpen && lang === 'he' ? 'md:mr-60' : ''}`}>
        {children}
    </div>
  );
};
