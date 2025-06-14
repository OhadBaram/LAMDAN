
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from 'react-dom/client';
import { Bot, User as UserIcon, Moon, Sun, Cpu, SendHorizontal, Search, MessageSquare, Paperclip, X, Upload, Languages, Loader2, Copy, FileText, Image as ImageIcon, ExternalLink, Share, UploadCloud, Download, Link as LinkIcon, Server, Plus, Check, Trash, ArrowRight, LayoutGrid, CheckCircle, XCircle, AlertCircle, Lock, Unlock, Cloud, RefreshCw, File as FileIconPkg, FileSpreadsheet, Palette, Type, Settings as SettingsIcon, Star, Calendar, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Sparkles, Brain, SlidersHorizontal, Users, Zap, Briefcase, ChevronDown, ChevronUp, GripVertical, Trash2, Edit3, Eye, Play, StopCircle, Mic, MicOff, Volume2, VolumeX, Maximize, Minimize, LogOut, DollarSign, Menu } from "lucide-react"; // Added Menu icon

import './index.css'; // Import global CSS

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
    errorDialog,
    setErrorDialog,
    changeLanguage,
    toggleTheme
  } = useAppContext(); // Removed isSidebarOpen, setIsSidebarOpen
  const { userProfile } = useUserSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


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

  const NavLink: React.FC<{item: typeof navItems[0], isMobile?: boolean}> = ({ item, isMobile }) => (
    <Button
      variant={currentPage === item.id ? 'default' : (isMobile ? 'ghost' : 'link')} // 'link' for desktop header, 'ghost' for mobile dropdown
      onClick={() => { setCurrentPageGlobal(item.id); setIsMobileMenuOpen(false); }}
      className={`w-full justify-start text-base 
                  ${isMobile ? 'px-4 py-3 rounded-lg' : 'px-3 py-2 rounded-lg text-sm'}
                  ${currentPage === item.id 
                      ? (isMobile ? 'bg-indigo-100 dark:bg-indigo-700/60 text-indigo-700 dark:text-indigo-200' : 'bg-white/20 hover:bg-white/30 text-white font-semibold')
                      : (isMobile 
                          ? `text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700` 
                          : `text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20`)
                  }`}
    >
      <item.icon className={`w-5 h-5 ${isMobile ? 'me-3' : 'me-1.5'} flex-shrink-0`} />
      {item.label}
    </Button>
  );


  return (
    <div className={`flex flex-col h-screen font-sans ${theme}`}>
      <header
        className="flex items-center justify-between p-3 md:p-4 shadow-lg text-white sticky top-0 z-50"
        style={{ backgroundColor: userProfile?.headerBgColor || '#2c3e50', color: userProfile?.headerTitleColor || '#ecf0f1' }}
      >
        <div className="flex items-center gap-2 md:gap-3">
            <Cpu className="w-7 h-7 md:w-8 md:h-8"/>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">{userProfile?.botName || 'LUMINA'}</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
               <NavLink key={item.id} item={item} />
            ))}
        </nav>

        <div className="flex items-center gap-1.5 md:gap-2">
          <Button
            variant="ghost"
            size="default" // Adjusted size
            onClick={() => changeLanguage(lang === 'he' ? 'en' : 'he')}
            title={lang === 'he' ? 'שנה שפה לאנגלית' : 'Change Language to Hebrew'}
            className="text-inherit hover:bg-white/20 active:bg-white/30 rounded-lg px-2.5 py-1.5 md:px-3 md:py-2"
          >
            <Languages className="w-5 h-5 md:w-5 md:h-5"/>
            <span className="hidden sm:inline ms-1.5 text-xs md:text-sm">{lang === 'he' ? 'English' : 'עברית'}</span>
          </Button>
          <Button
            variant="ghost"
            size="default" // Adjusted size
            onClick={toggleTheme}
            title={lang === 'he' ? 'שנה ערכת נושא' : 'Toggle Theme'}
            className="text-inherit hover:bg-white/20 active:bg-white/30 rounded-lg px-2.5 py-1.5 md:px-3 md:py-2"
          >
            {theme === 'light' ? <Moon className="w-5 h-5 md:w-5 md:h-5"/> : <Sun className="w-5 h-5 md:w-5 md:h-5"/>}
            <span className="hidden sm:inline ms-1.5 text-xs md:text-sm">{theme === 'light' ? (lang === 'he' ? 'כהה' : 'Dark') : (lang === 'he' ? 'בהיר' : 'Light')}</span>
          </Button>
          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-inherit hover:bg-white/20 active:bg-white/30 rounded-full">
                <Menu className="w-6 h-6"/>
            </Button>
        </div>
      </header>
      
      {/* Mobile Navigation Menu (Dropdown) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-slate-50 dark:bg-slate-800 shadow-xl z-40 p-4 border-b border-slate-200 dark:border-slate-700">
            <nav className="flex flex-col gap-2">
                {navItems.map(item => (
                    <NavLink key={item.id} item={item} isMobile={true} />
                ))}
            </nav>
        </div>
      )}


      <div className="flex flex-1 overflow-hidden" dir={lang === 'he' ? 'rtl' : 'ltr'}>
        {/* Sidebar removed */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-gray-100 dark:bg-gray-950">
             { (showOnboarding || apiSettings.length === 0 || !apiSettings.some(s=>s.isValid)) ? (
                <div className="flex-1 flex items-center justify-center p-4">
                    <OnboardingWizard onComplete={handleCompleteOnboarding} />
                </div>
            ) : (
                 <PageWrapper disablePadding={currentPage === 'chat'}> {/* Settings page might not need full disablePadding like chat */}
                    {renderPage()}
                </PageWrapper>
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
