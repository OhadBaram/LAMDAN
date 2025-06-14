
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from 'react-dom/client';
import { Bot, User as UserIcon, Moon, Sun, Cpu, SendHorizontal, Search, MessageSquare, Paperclip, X, Upload, Languages, Loader2, Copy, FileText, Image as ImageIcon, ExternalLink, Share, UploadCloud, Download, Link as LinkIcon, Server, Plus, Check, Trash, ArrowRight, LayoutGrid, CheckCircle, XCircle, AlertCircle, Lock, Unlock, Cloud, RefreshCw, File as FileIconPkg, FileSpreadsheet, Palette, Type, Settings as SettingsIcon, Star, Calendar, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Sparkles, Brain, SlidersHorizontal, Users, Zap, Briefcase, ChevronDown, ChevronUp, GripVertical, Trash2, Edit3, Eye, Play, StopCircle, Mic, MicOff, Volume2, VolumeX, Maximize, Minimize, LogOut, DollarSign } from "lucide-react";

import { AppProvider, useAppContext } from './contexts/AppContext';
import { UserSettingsProvider, useUserSettings } from './contexts/UserSettingsContext';

// Import UI Components
import { Button } from './components/ui/Button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from './components/ui/AlertDialog';

// Import Pages (Features)
import { ChatPage } from './features/Chat/ChatPage';
import { SettingsPage } from './features/Settings/SettingsPage';
import { CockpitPage } from './features/Cockpit/CockpitPage';
import { ArenaPage } from './features/Arena/ArenaPage';
import { SpacesPage } from './features/Spaces/SpacesPage';
import { AgentArenaPage } from './features/AgentArena/AgentArenaPage';
import { OnboardingWizard } from './features/Onboarding/OnboardingWizard';

// Import Layout Components
import { PageWrapper } from './components/layout/PageWrapper';


// --- Main Application Structure ---
const App: React.FC = () => {
  const {
    lang,
    theme,
    apiSettings,
    loadApiSettings,
    currentPage,
    setCurrentPageGlobal,
    showOnboarding,
    setShowOnboarding,
    isSidebarOpen,
    setIsSidebarOpen,
    errorDialog,
    setErrorDialog,
    changeLanguage,
    toggleTheme
  } = useAppContext();
  const { userProfile } = useUserSettings();

  const navItems = [
    { id: 'chat', label: lang === 'he' ? 'צ\'אט' : 'Chat', icon: MessageSquare },
    { id: 'arena', label: lang === 'he' ? 'זירת השוואות' : 'Arena', icon: Zap },
    { id: 'spaces', label: lang === 'he' ? 'מרחבים' : 'Spaces', icon: LayoutGrid },
    { id: 'agent_arena', label: lang === 'he' ? 'סוכנים' : 'Agents', icon: Brain },
    { id: 'cockpit', label: lang === 'he' ? 'קוקפיט' : 'Cockpit', icon: SlidersHorizontal },
    { id: 'settings', label: lang === 'he' ? 'הגדרות' : 'Settings', icon: SettingsIcon },
  ];

  const handleCompleteOnboarding = async () => {
    setShowOnboarding(false);
    await loadApiSettings();
  };

  const renderPage = () => {
    // The initial onboarding check is removed from here, as it's handled by the conditional
    // rendering in the <main> element. When this function is called from within PageWrapper,
    // the onboarding conditions are already false.
    switch (currentPage) {
      case 'chat': return <ChatPage />;
      case 'settings': return <SettingsPage />;
      case 'cockpit': return <CockpitPage />;
      case 'arena': return <ArenaPage />;
      case 'spaces': return <SpacesPage />;
      case 'agent_arena': return <AgentArenaPage />;
      default: return <ChatPage />;
    }
  };

  return (
    <div className={`flex flex-col h-screen font-sans ${theme}`}>
      <header
        className="flex items-center justify-between p-3 shadow-md text-white sticky top-0 z-40"
        style={{ backgroundColor: userProfile?.headerBgColor || '#1e3a8a', color: userProfile?.headerTitleColor || '#ffffff' }}
      >
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-inherit hover:bg-white/10">
                <LayoutGrid className="w-6 h-6"/>
            </Button>
            <Cpu className="w-8 h-8"/>
            <h1 className="text-xl font-bold">{userProfile?.botName || 'LUMINA'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeLanguage(lang === 'he' ? 'en' : 'he')}
            title={lang === 'he' ? 'שנה שפה לאנגלית' : 'Change Language to Hebrew'}
            className="text-inherit hover:bg-white/10"
          >
            <Languages className="w-5 h-5"/>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={lang === 'he' ? 'שנה ערכת נושא' : 'Toggle Theme'}
            className="text-inherit hover:bg-white/10"
          >
            {theme === 'light' ? <Moon className="w-5 h-5"/> : <Sun className="w-5 h-5"/>}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" dir={lang === 'he' ? 'rtl' : 'ltr'}>
        <aside className={`fixed md:sticky top-16 md:top-0 ${lang === 'he' ? 'right-0 border-l' : 'left-0 border-r'} h-[calc(100vh-4rem)] md:h-full w-60 bg-gray-100 dark:bg-gray-800 p-4 transition-transform duration-300 ease-in-out z-20 ${isSidebarOpen ? 'translate-x-0' : (lang === 'he' ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0')}`}>
            <nav className="flex flex-col gap-1">
                {navItems.map(item => (
                    <Button
                        key={item.id}
                        variant={currentPage === item.id ? 'default' : 'ghost'}
                        onClick={() => {setCurrentPageGlobal(item.id); setIsSidebarOpen(false);}}
                        className={`w-full justify-start ${currentPage === item.id ? 'bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        <item.icon className="w-4 h-4 me-3 flex-shrink-0"/>
                        {item.label}
                    </Button>
                ))}
            </nav>
        </aside>

        <main className={`flex-1 flex flex-col overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarOpen && lang === 'he' ? 'md:mr-60' : ''} ${isSidebarOpen && lang !== 'he' ? 'md:ml-60' : ''}`}>
             { (showOnboarding || apiSettings.length === 0 || !apiSettings.some(s=>s.isValid)) ? (
                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <OnboardingWizard onComplete={handleCompleteOnboarding} />
                </div>
            ) : (
                <PageWrapper>{renderPage()}</PageWrapper>
            )}
        </main>
      </div>

       <AlertDialog open={errorDialog.isOpen} onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={lang === 'he' ? 'text-right' : 'text-left'}>{errorDialog.title}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className={lang === 'he' ? 'text-right' : 'text-left'}>{errorDialog.message}</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setErrorDialog({ isOpen: false, title: '', message: '' })}>
              {lang === 'he' ? 'סגור' : 'Close'}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AppProvider>
        <UserSettingsProvider>
          <App />
        </UserSettingsProvider>
      </AppProvider>
    </React.StrictMode>
  );
} else {
  console.error("CRITICAL: Root element with ID 'root' was not found in the HTML. App cannot be mounted.");
}
