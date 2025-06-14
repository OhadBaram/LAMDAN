
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from 'react-dom/client';
import { Bot, User as UserIcon, Moon, Sun, Cpu, SendHorizontal, Search, MessageSquare, Paperclip, X, Upload, Languages, Loader2, Copy, FileText, Image as ImageIcon, ExternalLink, Share, UploadCloud, Download, Link as LinkIcon, Server, Plus, Check, Trash, ArrowRight, LayoutGrid, CheckCircle, XCircle, AlertCircle, Lock, Unlock, Cloud, RefreshCw, File as FileIconPkg, FileSpreadsheet, Palette, Type, Settings as SettingsIcon, Star, Calendar, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Sparkles, Brain, SlidersHorizontal, Users, Zap, Briefcase, ChevronDown, ChevronUp, GripVertical, Trash2, Edit3, Eye, Play, StopCircle, Mic, MicOff, Volume2, VolumeX, Maximize, Minimize, LogOut, DollarSign, Menu, Database, Award, Activity, ShieldCheck } from "lucide-react"; // Added Menu, Database, UserIcon (for profile), Award, Activity icons

import './index.css'; // Import global CSS

import { AppProvider, useAppContext } from './contexts/AppContext';
import { UserSettingsProvider, useUserSettings } from './contexts/UserSettingsContext';

// Import UI Components
import { Button } from './components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './components/ui/Dialog'; // Added Dialog for Profile
import { AlertDialog, AlertDialogContent as AlertDialogContentComponent, AlertDialogHeader as AlertDialogHeaderComponent, AlertDialogTitle as AlertDialogTitleComponent, AlertDialogDescription, AlertDialogFooter as AlertDialogFooterComponent, AlertDialogCancel } from './components/ui/AlertDialog'; // Renamed imports

// Import Pages (Features)
import { ChatPage } from './features/Chat/ChatPage';
import { SettingsPage } from './features/Settings/SettingsPage';
import { CockpitPage } from './features/Cockpit/CockpitPage';
import { ArenaPage } from './features/Arena/ArenaPage';
import { SpacesPage } from './features/Spaces/SpacesPage';
import { AgentArenaPage } from './features/AgentArena/AgentArenaPage';
import { KnowledgeBasePage } from './features/KnowledgeBase/KnowledgeBasePage'; 
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
  } = useAppContext(); 
  const { userProfile, markFeatureVisited } = useUserSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);


  const navItems = [
    { id: 'chat', label: lang === 'he' ? 'צ\'אט' : 'Chat', icon: MessageSquare, featureKey: null },
    { id: 'knowledge_base', label: lang === 'he' ? 'מאגר ידע' : 'Knowledge Base', icon: Database, featureKey: 'visitedKnowledgeBase' },
    { id: 'arena', label: lang === 'he' ? 'זירת השוואות' : 'Arena', icon: Zap, featureKey: 'visitedArena' },
    { id: 'spaces', label: lang === 'he' ? 'מרחבים' : 'Spaces', icon: LayoutGrid, featureKey: 'visitedSpaces' },
    { id: 'agent_arena', label: lang === 'he' ? 'סוכנים' : 'Agents', icon: Brain, featureKey: 'visitedAgentArena' },
    { id: 'cockpit', label: lang === 'he' ? 'קוקפיט' : 'Cockpit', icon: SlidersHorizontal, featureKey: 'visitedCockpit' },
    { id: 'settings', label: lang === 'he' ? 'הגדרות' : 'Settings', icon: SettingsIcon, featureKey: null },
  ] as const; // Added 'as const' for featureKey type safety

  const handlePageChange = (pageId: typeof navItems[number]['id']) => {
    console.log('handlePageChange called with pageId:', pageId); // DEBUG LOG
    setCurrentPageGlobal(pageId);
    setIsMobileMenuOpen(false);
    const navItem = navItems.find(item => item.id === pageId);
    if (navItem && navItem.featureKey) {
        markFeatureVisited(navItem.featureKey);
    }
  };


  const handleCompleteOnboarding = async () => {
    console.log('handleCompleteOnboarding triggered in App.tsx'); // DEBUG LOG
    setShowOnboarding(false);
    console.log('setShowOnboarding(false) called in App.tsx'); // DEBUG LOG
    await loadApiSettings();
    console.log('loadApiSettings finished after onboarding completion in App.tsx'); // DEBUG LOG
  };

  const renderPage = () => {
    let content;
    switch (currentPage) {
      case 'chat': content = <ChatPage />; break;
      case 'settings': content = <SettingsPage />; break;
      case 'cockpit': content = <CockpitPage />; break;
      case 'arena': content = <ArenaPage />; break;
      case 'spaces': content = <SpacesPage />; break;
      case 'agent_arena': content = <AgentArenaPage />; break;
      case 'knowledge_base': content = <KnowledgeBasePage />; break;
      default: content = <ChatPage />;
    }

    // Apply max-width to content for specific pages
    const constrainedPages = ['settings', 'cockpit', 'arena', 'spaces', 'agent_arena', 'knowledge_base']; // Added knowledge_base
    const wrapperClass = constrainedPages.includes(currentPage) ? 'max-w-4xl mx-auto w-full' : '';

    return <div className={wrapperClass}>{content}</div>;
  };

  const NavLink: React.FC<{item: typeof navItems[number], isMobile?: boolean}> = ({ item, isMobile }) => (
    <Button
      variant={'ghost'} 
      onClick={() => { console.log('NavLink clicked for item:', item.id); handlePageChange(item.id); }} // DEBUG LOG
      className={`justify-start text-base transition-std
                  ${isMobile ? 'w-full px-3 py-2.5 rounded-md' : 'px-2 py-1.5 rounded-md text-sm'}
                  ${currentPage === item.id 
                      ? (isMobile ? 'bg-[var(--bg-primary)] text-[var(--accent)] font-medium' : 'bg-white/10 text-white font-medium') // Desktop active retains some contrast on dark header
                      : (isMobile 
                          ? `text-[var(--text-primary)] hover:bg-[var(--bg-primary)]` 
                          : `text-white/80 hover:text-white hover:bg-white/10`)
                  }`}
    >
      <item.icon className={`w-4 h-4 ${isMobile ? 'me-2.5' : 'me-1.5'} flex-shrink-0`} />
      {item.label}
    </Button>
  );

  const getBadgeIcon = (badgeKey: string) => {
    switch(badgeKey) {
        case 'EXPLORER': return <Search className="w-5 h-5 text-yellow-400" />;
        case 'COMMUNICATOR': return <MessageSquare className="w-5 h-5 text-blue-400" />;
        case 'ENGAGED_USER': return <Star className="w-5 h-5 text-orange-400" />;
        default: return <Award className="w-5 h-5 text-gray-400" />;
    }
  };
  const badgeDisplayNames: Record<string, { he: string, en: string }> = {
    EXPLORER: { he: "חוקר", en: "Explorer" },
    COMMUNICATOR: { he: "מתקשר", en: "Communicator" },
    ENGAGED_USER: { he: "משתמש פעיל", en: "Engaged User" },
  };


  return (
    <div className={`flex flex-col h-screen font-sans bg-[var(--bg-primary)] text-[var(--text-primary)]`}>
      <header
        className="flex items-center justify-between p-3 shadow-md text-white sticky top-0 z-50 bg-[var(--bg-secondary)] border-b border-[var(--border)]"
      >
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => { console.log('Mobile menu button clicked. Current state:', isMobileMenuOpen); setIsMobileMenuOpen(!isMobileMenuOpen);}} className="md:hidden text-white hover:bg-white/10 active:bg-white/20 rounded-md p-1.5"> {/* DEBUG LOG */}
                <Menu className="w-5 h-5"/>
            </Button>
            <h1 className="text-lg font-medium tracking-tight text-[var(--text-primary)]">{userProfile?.botName || 'LUMINA'}</h1>
        </div>

        {/* Desktop Navigation (Simplified to match ChatGPT's focused approach) */}
        <nav className="hidden md:flex items-center gap-1.5"> {/* Increased gap from 0.5 to 1.5 */}
            {navItems.filter(item => ['chat', 'settings'].includes(item.id)).map(item => ( // Example: Only show Chat & Settings directly in header
               <NavLink key={item.id} item={item} />
            ))}
             {/* Could add a dropdown for other pages if header space is an issue */}
        </nav>

        <div className="flex items-center gap-1">
            {userProfile && (
                <div className="hidden sm:flex items-center gap-1.5 me-1.5 text-xs">
                    <div className="flex items-center gap-0.5 p-1 bg-[var(--bg-primary)] rounded-md" title={`XP: ${userProfile.userXP || 0}`}>
                        <Star className="w-3 h-3 text-yellow-400"/> 
                        <span className="text-[var(--text-secondary)]">{userProfile.userXP || 0}</span>
                    </div>
                    <div className="flex items-center gap-0.5 p-1 bg-[var(--bg-primary)] rounded-md" title={`Daily Streak: ${userProfile.dailyStreak || 0}`}>
                         <Activity className="w-3 h-3 text-red-400"/> 
                         <span className="text-[var(--text-secondary)]">{userProfile.dailyStreak || 0}</span>
                    </div>
                </div>
            )}
           <Button
            variant="ghost"
            size="icon" 
            onClick={() => setShowProfileModal(true)}
            title={lang === 'he' ? 'פרופיל משתמש' : 'User Profile'}
            className="text-[var(--text-primary)] hover:bg-[var(--border)] active:bg-[var(--border)] rounded-md p-1.5"
          >
            <UserIcon className="w-4 h-4"/>
          </Button>
          <Button
            variant="ghost"
            size="icon" 
            onClick={toggleTheme}
            title={lang === 'he' ? 'שנה ערכת נושא' : 'Toggle Theme'}
            className="text-[var(--text-primary)] hover:bg-[var(--border)] active:bg-[var(--border)] rounded-md p-1.5"
          >
            {theme === 'light' ? <Moon className="w-4 h-4"/> : <Sun className="w-4 h-4"/>}
          </Button>
        </div>
      </header>
      
      {/* Mobile Navigation Menu (Sidebar-like) */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        >
            <div 
                className={`absolute top-0 h-full w-64 bg-[var(--bg-secondary)] shadow-xl p-4 border-[var(--border)] transition-std 
                            ${lang === 'he' ? 'right-0 border-l' : 'left-0 border-r'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} 
                        className={`absolute top-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 
                                    ${lang === 'he' ? 'left-2' : 'right-2'}`}>
                    <X className="w-5 h-5"/>
                </Button>
                <div className="mt-8 flex flex-col gap-1.5">
                    {navItems.map(item => (
                        <NavLink key={item.id} item={item} isMobile={true} />
                    ))}
                </div>
                 <div className="mt-auto pt-4 border-t border-[var(--border)]">
                     <Button
                        variant="ghost"
                        size="default" 
                        onClick={() => changeLanguage(lang === 'he' ? 'en' : 'he')}
                        title={lang === 'he' ? 'שנה שפה לאנגלית' : 'Change Language to Hebrew'}
                        className="w-full justify-start text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] rounded-md px-3 py-2.5 text-base"
                    >
                        <Languages className="w-4 h-4 me-2.5"/>
                        <span>{lang === 'he' ? 'English' : 'עברית'}</span>
                    </Button>
                </div>
            </div>
        </div>
      )}


      <div className="flex flex-1 overflow-hidden" dir={lang === 'he' ? 'rtl' : 'ltr'}>
        <main className="flex-1 flex flex-col overflow-y-auto bg-[var(--bg-primary)]">
             { (showOnboarding || apiSettings.length === 0 || !apiSettings.some(s=>s.isValid)) ? (
                <div className="flex-1 flex items-center justify-center p-4">
                    <OnboardingWizard onComplete={handleCompleteOnboarding} />
                </div>
            ) : (
                 <PageWrapper disablePadding={currentPage === 'chat'}> 
                    {renderPage()}
                </PageWrapper>
            )}
        </main>
      </div>

       <AlertDialog open={errorDialog.isOpen} onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContentComponent>
          <AlertDialogHeaderComponent>
            <AlertDialogTitleComponent className={lang === 'he' ? 'text-right' : 'text-left'}>{errorDialog.title}</AlertDialogTitleComponent>
          </AlertDialogHeaderComponent>
          <AlertDialogDescription className={lang === 'he' ? 'text-right' : 'text-left'}>{errorDialog.message}</AlertDialogDescription>
          <AlertDialogFooterComponent>
            <AlertDialogCancel onClick={() => setErrorDialog({ isOpen: false, title: '', message: '' })}>
              {lang === 'he' ? 'הבנתי' : 'Got it'}
            </AlertDialogCancel>
          </AlertDialogFooterComponent>
        </AlertDialogContentComponent>
      </AlertDialog>

      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal} size="md">
        <DialogHeader>
            <DialogTitle>{lang === 'he' ? 'פרופיל והישגים' : 'Profile & Achievements'}</DialogTitle>
        </DialogHeader>
        <DialogContent className="p-6 space-y-4">
            {userProfile && (
                <>
                    <div>
                        <h3 className="text-lg font-medium text-[var(--text-primary)]">{userProfile.userName || (lang === 'he' ? 'משתמש' : 'User')}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">{lang === 'he' ? 'בוט:' : 'Bot:'} {userProfile.botName || 'LUMINA'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col items-center p-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-md">
                            <Star className="w-7 h-7 text-yellow-400 mb-1.5"/>
                            <span className="text-xl font-medium text-[var(--text-primary)]">{userProfile.userXP || 0}</span>
                            <span className="text-xs text-[var(--text-secondary)]">XP</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-md">
                            <Activity className="w-7 h-7 text-red-400 mb-1.5"/>
                            <span className="text-xl font-medium text-[var(--text-primary)]">{userProfile.dailyStreak || 0}</span>
                            <span className="text-xs text-[var(--text-secondary)]">{lang === 'he' ? 'ימי רצף' : 'Day Streak'}</span>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium mb-1.5 text-[var(--text-primary)] text-sm">{lang === 'he' ? 'תגים שהושגו:' : 'Badges Earned:'}</h4>
                        {(userProfile.badges && userProfile.badges.length > 0) ? (
                            <ul className="space-y-1.5">
                                {userProfile.badges.map(badgeKey => (
                                    <li key={badgeKey} className="flex items-center gap-2 p-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-md">
                                        {getBadgeIcon(badgeKey)}
                                        <span className="text-sm font-normal text-[var(--text-secondary)]">{badgeDisplayNames[badgeKey]?.[lang as 'he' | 'en'] || badgeKey}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-[var(--text-secondary)]">{lang === 'he' ? 'עדיין אין תגים. המשך להשתמש באפליקציה כדי להרוויח!' : 'No badges yet. Keep using the app to earn them!'}</p>
                        )}
                    </div>
                </>
            )}
        </DialogContent>
        <DialogFooter>
            <Button variant="ghost" onClick={() => setShowProfileModal(false)}>{lang === 'he' ? 'סגור' : 'Close'}</Button>
        </DialogFooter>
      </Dialog>

    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <UserSettingsProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </UserSettingsProvider>
    </React.StrictMode>
  );
} else {
  console.error("CRITICAL: Root element with ID 'root' was not found in the HTML. App cannot be mounted.");
}
