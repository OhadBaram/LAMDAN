
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from 'react-dom/client';
import { Bot, User as UserIcon, Moon, Sun, Cpu, SendHorizontal, Search, MessageSquare, Paperclip, X, Upload, Languages, Loader2, Copy, FileText, Image as ImageIcon, ExternalLink, Share, UploadCloud, Download, Link as LinkIcon, Server, Plus, Check, Trash, ArrowRight, LayoutGrid, CheckCircle, XCircle, AlertCircle, Lock, Unlock, Cloud, RefreshCw, File as FileIconPkg, FileSpreadsheet, Palette, Type, Settings as SettingsIcon, Star, Calendar, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Sparkles, Brain, SlidersHorizontal, Users, Zap, Briefcase, ChevronDown, ChevronUp, GripVertical, Trash2, Edit3, Eye, Play, StopCircle, Mic, MicOff, Volume2, VolumeX, Maximize, Minimize, LogOut, DollarSign, Menu, Database, Award, Activity, ShieldCheck, HelpCircle, MessageCircleQuestion } from "lucide-react";

import './index.css'; 

import { AppProvider, useAppContext } from './contexts/AppContext';
import { UserSettingsProvider, useUserSettings } from './contexts/UserSettingsContext';

import { Button } from './components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './components/ui/Dialog'; 
import { AlertDialog, AlertDialogContent as AlertDialogContentComponent, AlertDialogHeader as AlertDialogHeaderComponent, AlertDialogTitle as AlertDialogTitleComponent, AlertDialogDescription, AlertDialogFooter as AlertDialogFooterComponent, AlertDialogCancel } from './components/ui/AlertDialog'; 

import { ChatPage } from './features/Chat/ChatPage';
import { SettingsPage } from './features/Settings/SettingsPage';
// The following pages will now be routed through SettingsPage as tabs
// import { CockpitPage } from './features/Cockpit/CockpitPage';
// import { ArenaPage } from './features/Arena/ArenaPage';
// import { SpacesPage } from './features/Spaces/SpacesPage';
// import { AgentArenaPage } from './features/AgentArena/AgentArenaPage';
// import { KnowledgeBasePage } from './features/KnowledgeBase/KnowledgeBasePage'; 
import { OnboardingWizard } from './features/Onboarding/OnboardingWizard';
import { PageWrapper } from './components/layout/PageWrapper';

// SidePanel Component (New for Gemini-like UI)
const SidePanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (pageId: 'chat' | 'settings') => void;
  currentNavPage: 'chat' | 'settings';
}> = ({ isOpen, onClose, onNavigate, currentNavPage }) => {
  const { lang, theme, toggleTheme } = useAppContext();
  const { userProfile } = useUserSettings();

  const handleSettingsNavigation = () => {
    onNavigate('settings');
    // onClose(); // Close panel after navigating to settings
  };
  const handleChatNavigation = () => {
    onNavigate('chat');
    // onClose();
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}
      <div 
        className={`fixed inset-y-0 h-full shadow-lg transition-transform duration-300 ease-in-out z-40 flex flex-col gemini-sidebar
                    ${lang === 'he' ? 'right-0 border-l' : 'left-0 border-r'} 
                    ${isOpen ? 'translate-x-0 w-72' : (lang === 'he' ? 'translate-x-full w-72' : '-translate-x-full w-72')}
                    md:relative md:translate-x-0 md:border-r md:w-72 ${isOpen ? 'md:w-72' : 'md:w-0 md:invisible md:opacity-0 md:p-0 md:border-none'}`}
      >
        <div className={`flex-1 overflow-y-auto scrollbar-thin ${isOpen ? 'p-3' : 'p-0'}`}>
          {isOpen && (
            <>
              <div className="mb-4">
                <Button onClick={handleChatNavigation} className="w-full gemini-sidebar-button">
                  <span className="gemini-sidebar-button-icon"><Plus /></span>
                  {lang === 'he' ? 'שיחה חדשה' : 'New Chat'}
                </Button>
              </div>

              {/* Placeholder for Agents - visual only */}
              <div className="mb-4">
                <h3 className="gemini-sidebar-section-title">Agents</h3>
                {/* Example Agent items - replace with dynamic data later */}
                {[
                  { name: lang === 'he' ? "מסמכי פרומפטים" : "Prompt Documents", color: "bg-purple-500", letter: "P" },
                  { name: lang === 'he' ? "חוקר אינטרנט" : "Web Explorer", color: "bg-sky-500", letter: "W" },
                ].map(agent => (
                  <a key={agent.name} href="#" className="gemini-sidebar-link group">
                     <span className={`w-5 h-5 rounded-sm ${agent.color} text-white flex items-center justify-center text-xs font-medium me-2.5 group-hover:opacity-90`}>{agent.letter}</span>
                    {agent.name}
                  </a>
                ))}
              </div>

              {/* Placeholder for Recent Activity - visual only */}
              <div className="mb-4">
                <h3 className="gemini-sidebar-section-title">{lang === 'he' ? 'אחרונות' : 'Recent'}</h3>
                {/* Example Recent items - replace with dynamic data later */}
                {["איך להכין עוגת שוקולד?", "רעיונות לחופשה באיטליה"].map(item => (
                   <a key={item} href="#" className="gemini-sidebar-link group text-sm truncate">
                     <MessageSquare className="w-4 h-4 me-2.5 text-gray-500 group-hover:text-[var(--text-primary)]"/>
                    {item}
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
        
        {isOpen && (
          <div className="p-3 border-t border-[var(--border-sidebar-light)]">
            <div className="flex items-center justify-between mb-3">
              <Button variant="ghost" size="icon" onClick={onClose} title={lang === 'he' ? 'כווץ סרגל צד' : 'Collapse sidebar'} className="gemini-header-icon p-1.5 rounded-md">
                <ChevronLeft className={`w-5 h-5 ${lang === 'he' ? 'transform scale-x-[-1]' : ''}`} />
              </Button>
              <div className="flex items-center gap-1 p-0.5 rounded-full bg-[var(--bg-tertiary-light)] gemini-sidebar-theme-toggle">
                <Button variant="ghost" size="icon" onClick={toggleTheme} title={lang === 'he' ? 'מצב בהיר' : 'Light mode'} className={`rounded-full ${theme === 'light' ? 'active' : ''}`}>
                  <Sun className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleTheme} title={lang === 'he' ? 'מצב כהה' : 'Dark mode'} className={`rounded-full ${theme === 'dark' ? 'active' : ''}`}>
                  <Moon className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <a href="#" onClick={(e) => { e.preventDefault(); /* TODO: Implement Help */ }} className="gemini-sidebar-link text-sm">
                <HelpCircle className="w-4 h-4 text-gray-500"/>{lang === 'he' ? 'עזרה' : 'Help'}
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); /* TODO: Implement Feedback */ }} className="gemini-sidebar-link text-sm">
                <MessageCircleQuestion className="w-4 h-4 text-gray-500"/>{lang === 'he' ? 'שליחת משוב' : 'Send feedback'}
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleSettingsNavigation(); }} className={`gemini-sidebar-link text-sm ${currentNavPage === 'settings' ? 'active' : ''}`}>
                <SettingsIcon className={`w-4 h-4 ${currentNavPage === 'settings' ? 'text-white' : 'text-gray-500'}`}/>{lang === 'he' ? 'הגדרות' : 'Settings'}
            </a>

            {userProfile?.shareLocation && (
              <div className="mt-3 pt-3 border-t border-[var(--border-sidebar-light)]">
                <p className="gemini-location-text px-3">{lang === 'he' ? 'פתח תקווה, ישראל' : 'Petah Tikva, Israel'}</p>
                <a href="#" onClick={(e) => {e.preventDefault(); handleSettingsNavigation();}} className="gemini-location-link px-3 block hover:underline">
                  {lang === 'he' ? 'על סמך המקומות שלך (בית) - עדכן את המיקום' : 'From your places (Home) - Update location'}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};


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
  const { userProfile } = useUserSettings(); // Removed markFeatureVisited as it's not used directly here anymore.
  
  // Single state for SidePanel visibility
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false); 
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Simplified navigation for main pages (Chat & Settings)
  const handlePageNavigation = (pageId: 'chat' | 'settings') => {
    setCurrentPageGlobal(pageId);
    if(window.innerWidth < 768) { // Close mobile sidebar on navigation
        setIsSidePanelOpen(false);
    }
  };


  const handleCompleteOnboarding = async () => {
    setShowOnboarding(false);
    await loadApiSettings();
  };

  const renderPage = () => {
    let content;
    switch (currentPage) {
      case 'chat': content = <ChatPage />; break;
      case 'settings': content = <SettingsPage />; break;
      default: content = <ChatPage />;
    }
    // max-width is handled by PageWrapper or specific page components
    return <PageWrapper disablePadding={currentPage === 'chat'}>{content}</PageWrapper>;
  };
  
  const getProfileInitial = () => {
    const name = userProfile?.userName || (lang === 'he' ? "מ" : "U");
    return name.charAt(0).toUpperCase();
  };

  const getBadgeIcon = (badgeKey: string) => {
    switch(badgeKey) {
        case 'EXPLORER': return <Search className="w-5 h-5 text-yellow-500" />;
        case 'COMMUNICATOR': return <MessageSquare className="w-5 h-5 text-blue-500" />;
        case 'ENGAGED_USER': return <Star className="w-5 h-5 text-orange-500" />;
        default: return <Award className="w-5 h-5 text-gray-500" />;
    }
  };
  const badgeDisplayNames: Record<string, { he: string, en: string }> = {
    EXPLORER: { he: "חוקר", en: "Explorer" },
    COMMUNICATOR: { he: "מתקשר", en: "Communicator" },
    ENGAGED_USER: { he: "משתמש פעיל", en: "Engaged User" },
  };


  return (
    <div className={`flex flex-col h-screen font-sans bg-[var(--bg-primary)] text-[var(--text-primary)]`} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      {/* New Gemini-like Header */}
      <header
        className="flex items-center justify-between px-3 py-2 shadow-sm sticky top-0 z-20"
        style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-light)' }}
      >
        {/* Right side (RTL) / Left side (LTR) */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="gemini-header-icon p-1.5 rounded-md">
            <Menu className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" title={lang === 'he' ? 'חיפוש' : 'Search'} className="gemini-header-icon p-1.5 rounded-md">
            <Search className="w-5 h-5" />
          </Button>
        </div>

        {/* Center - Model Selector Placeholder */}
        <div className="gemini-model-selector">
          <span className="gemini-model-name">Gemini</span>
          <span className="gemini-model-version-tag">Pro 2.5 (גרסת טרום-השקה) - Preview</span>
        </div>

        {/* Left side (RTL) / Right side (LTR) */}
        <div className="flex items-center gap-2">
          <span className="gemini-pro-tag">PRO</span>
          <Button variant="ghost" size="icon" onClick={() => setShowProfileModal(true)} title={lang === 'he' ? 'פרופיל' : 'Profile'} className="p-0">
             <div className="gemini-profile-icon">
                {getProfileInitial()}
                <span className="gemini-profile-online-dot"></span>
            </div>
          </Button>
          {/* Language toggle moved to SidePanel for cleaner header, or keep here if preferred */}
           <Button
            variant="ghost"
            size="icon"
            onClick={() => changeLanguage(lang === 'he' ? 'en' : 'he')}
            title={lang === 'he' ? 'שנה שפה לאנגלית' : 'Change Language to Hebrew'}
            className="text-[var(--text-secondary-light)] hover:bg-[var(--border-light)] active:bg-[var(--border-light)] rounded-md p-1.5"
          >
            <Languages className="w-5 h-5"/>
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <SidePanel 
          isOpen={isSidePanelOpen} 
          onClose={() => setIsSidePanelOpen(false)} 
          onNavigate={handlePageNavigation}
          currentNavPage={currentPage as ('chat' | 'settings')}
        />
        <main className="flex-1 flex flex-col overflow-y-auto bg-[var(--bg-primary)]">
             { (showOnboarding || apiSettings.length === 0 || !apiSettings.some(s=>s.isValid)) ? (
                <div className="flex-1 flex items-center justify-center p-4">
                    <OnboardingWizard onComplete={handleCompleteOnboarding} />
                </div>
            ) : (
                renderPage() // PageWrapper is inside renderPage now
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
                        <div className="flex flex-col items-center p-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md">
                            <Star className="w-7 h-7 text-yellow-500 mb-1.5"/>
                            <span className="text-xl font-medium text-[var(--text-primary)]">{userProfile.userXP || 0}</span>
                            <span className="text-xs text-[var(--text-secondary)]">XP</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md">
                            <Activity className="w-7 h-7 text-red-500 mb-1.5"/>
                            <span className="text-xl font-medium text-[var(--text-primary)]">{userProfile.dailyStreak || 0}</span>
                            <span className="text-xs text-[var(--text-secondary)]">{lang === 'he' ? 'ימי רצף' : 'Day Streak'}</span>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium mb-1.5 text-[var(--text-primary)] text-sm">{lang === 'he' ? 'תגים שהושגו:' : 'Badges Earned:'}</h4>
                        {(userProfile.badges && userProfile.badges.length > 0) ? (
                            <ul className="space-y-1.5">
                                {userProfile.badges.map(badgeKey => (
                                    <li key={badgeKey} className="flex items-center gap-2 p-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md">
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
