
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from 'react-dom/client';
import { Bot, User as UserIcon, Moon, Sun, Cpu, SendHorizontal, Search, MessageSquare, Paperclip, X, Upload, Languages, Loader2, Copy, FileText, Image as ImageIcon, ExternalLink, Share, UploadCloud, Download, Link as LinkIcon, Server, Plus, Check, Trash, ArrowRight, LayoutGrid, CheckCircle, XCircle, AlertCircle, Lock, Unlock, Cloud, RefreshCw, File as FileIconPkg, FileSpreadsheet, Palette, Type, Settings as SettingsIcon, Star, Calendar, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Sparkles, Brain, SlidersHorizontal, Users, Zap, Briefcase, ChevronDown, ChevronUp, GripVertical, Trash2, Edit3, Eye, Play, StopCircle, Mic, MicOff, Volume2, VolumeX, Maximize, Minimize, LogOut, DollarSign, Menu, Database, Award, Activity, ShieldCheck, HelpCircle, MessageCircleQuestionIcon as MessageCircleQuestion } from "lucide-react";

import './index.css'; 

import { AppProvider, useAppContext } from './contexts/AppContext';
import { UserSettingsProvider, useUserSettings } from './contexts/UserSettingsContext';

import { Button } from './components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './components/ui/Dialog'; 
import { AlertDialog, AlertDialogContent as AlertDialogContentComponent, AlertDialogHeader as AlertDialogHeaderComponent, AlertDialogTitle as AlertDialogTitleComponent, AlertDialogDescription, AlertDialogFooter as AlertDialogFooterComponent, AlertDialogCancel } from './components/ui/AlertDialog'; 

import { ChatPage } from './features/Chat/ChatPage';
import { SettingsPage } from './features/Settings/SettingsPage';
import { OnboardingWizard } from './features/Onboarding/OnboardingWizard';
import { PageWrapper } from './components/layout/PageWrapper';

// Sidebar Component (New Chatbot UI Style)
const SidePanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (pageId: string) => void; 
  currentNavPage: string;
  navItems: Array<{ id: string; labelKey: { he: string; en: string }; icon: React.ElementType }>;
}> = ({ isOpen, onClose, onNavigate, currentNavPage, navItems }) => {
  const { lang, theme, toggleTheme } = useAppContext();
  const { userProfile } = useUserSettings();

  const handleNavigation = (pageId: string) => {
    onNavigate(pageId);
    if (window.innerWidth < 768) { 
        onClose();
    }
  };
  
  const isLightThemeActive = theme === 'light';

  return (
    <>
      {isOpen && window.innerWidth < 768 && (
        <div 
          className="chatbot-ui-sidebar-overlay open"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside 
        className={`chatbot-ui-sidebar fixed inset-y-0 h-full shadow-lg 
                    ${lang === 'he' ? 'right-0' : 'left-0'} 
                    ${isOpen ? 'translate-x-0 w-72 md:w-[var(--sidebar-width-desktop)]' : (lang === 'he' ? 'translate-x-full w-72 md:w-0' : '-translate-x-full w-72 md:w-0')}
                    md:relative md:translate-x-0 md:w-[var(--sidebar-width-desktop)] ${isOpen ? 'md:w-[var(--sidebar-width-desktop)]' : 'md:w-0 md:invisible md:opacity-0 md:p-0 md:border-none'}`}
        aria-hidden={!isOpen && window.innerWidth >= 768 ? 'true' : undefined}
        tabIndex={isOpen ? 0 : -1}
      >
        <div className={`flex-1 overflow-y-auto scrollbar-thin ${isOpen ? 'p-4' : 'p-0'}`}>
          {isOpen && (
            <>
              <div className="mb-5"> 
                <Button onClick={() => handleNavigation('chat')} className="chatbot-ui-new-chat-button w-full">
                  <span className="new-chat-plus-icon"><Plus strokeWidth={2.5} size={18}/></span>
                  {lang === 'he' ? 'צ\'אט חדש' : 'New Chat'}
                </Button>
              </div>

              <nav aria-label={lang === 'he' ? 'ניווט ראשי' : 'Main Navigation'}>
                <h2 className="chatbot-ui-history-title">{lang === 'he' ? 'ניווט' : 'Navigation'}</h2>
                <ul className="space-y-1">
                    {navItems.map(item => (
                        <li key={item.id}>
                            <a 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); handleNavigation(item.id);}}
                                className={`chatbot-ui-sidebar-link ${currentNavPage === item.id ? 'active' : ''}`}
                                aria-current={currentNavPage === item.id ? 'page' : undefined}
                            >
                                <item.icon />
                                {item.labelKey[lang as 'he' | 'en']}
                            </a>
                        </li>
                    ))}
                </ul>
              </nav>
              
              <div className="my-6">
                <h3 className="chatbot-ui-history-title">Agents (Placeholder)</h3>
                <a href="#" className="chatbot-ui-sidebar-link group">
                    <Users/> Placeholder Agent 1
                </a>
              </div>
              <div className="my-6">
                <h3 className="chatbot-ui-history-title">{lang === 'he' ? 'פעילות אחרונה (Placeholder)' : 'Recent Activity (Placeholder)'}</h3>
                <a href="#" className="chatbot-ui-sidebar-link group text-sm truncate">
                    <MessageSquare/> Example Recent Chat
                </a>
              </div>
            </>
          )}
        </div>
        
        {isOpen && (
          <div className="p-4 border-t border-[var(--border-sidebar-new)]">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={onClose} title={lang === 'he' ? 'כווץ סרגל צד' : 'Collapse sidebar'} className="p-2 text-[var(--text-muted-new)] hover:bg-[var(--bg-input-new)]">
                <ChevronLeft className={`w-5 h-5 ${lang === 'he' ? 'transform scale-x-[-1]' : ''}`} />
              </Button>
              <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--bg-input-new)]">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => { if (!isLightThemeActive) toggleTheme(); }} 
                    title={lang === 'he' ? 'מצב בהיר' : 'Light mode'} 
                    className={`p-1.5 rounded-full ${isLightThemeActive ? 'bg-[#e8eaed] text-[var(--text-normal-new)]' : 'text-[var(--text-muted-new)] hover:text-[var(--text-normal-new)]'}`}
                    aria-pressed={isLightThemeActive}
                >
                  <Sun className="w-4 h-4" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => { if (isLightThemeActive) toggleTheme(); }} 
                    title={lang === 'he' ? 'מצב כהה' : 'Dark mode'} 
                    className={`p-1.5 rounded-full ${!isLightThemeActive ? 'bg-[#3c4043] text-white' : 'text-[var(--text-muted-new)] hover:text-[var(--text-normal-new)]'}`} /* Adjusted dark active */
                    aria-pressed={!isLightThemeActive}
                >
                  <Moon className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <ul className="space-y-0.5">
                <li><a href="#" onClick={(e) => { e.preventDefault(); /* TODO: Implement Help */ }} className="chatbot-ui-sidebar-footer-link">
                    <HelpCircle />{lang === 'he' ? 'עזרה' : 'Help'}
                </a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); /* TODO: Implement Feedback */ }} className="chatbot-ui-sidebar-footer-link">
                    <MessageCircleQuestion />{lang === 'he' ? 'שליחת משוב' : 'Send feedback'}
                </a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('settings'); }} className={`chatbot-ui-sidebar-footer-link ${currentNavPage === 'settings' ? 'active' : ''}`}>
                    <SettingsIcon />{lang === 'he' ? 'הגדרות' : 'Settings'}
                </a></li>
            </ul>

            {userProfile?.shareLocation && (
              <div className="mt-4 pt-4 border-t border-[var(--border-sidebar-new)]">
                <p className="text-[11px] text-[var(--text-muted-new)] px-1">{lang === 'he' ? 'פתח תקווה, ישראל (Placeholder)' : 'Petah Tikva, Israel (Placeholder)'}</p>
                <a href="#" onClick={(e) => {e.preventDefault(); handleNavigation('settings');}} className="text-[11px] text-[var(--color-primary-new)] px-1 block hover:underline">
                  {lang === 'he' ? 'על סמך המקומות שלך (בית) - עדכן מיקום' : 'From your places (Home) - Update location'}
                </a>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
};

const navItemsConfig = [
    { id: 'chat', labelKey: { he: 'צ\'אט', en: 'Chat' }, icon: MessageSquare },
    { id: 'settings', labelKey: { he: 'הגדרות', en: 'Settings' }, icon: SettingsIcon },
];


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
  } = useAppContext(); 
  const { userProfile } = useUserSettings();
  
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(window.innerWidth >= 768);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handlePageNavigation = (pageId: string) => {
    setCurrentPageGlobal(pageId);
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
    // PageWrapper provides its own background. ChatPage specific background is white.
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
    <div className={`flex flex-col h-screen font-sans bg-[var(--bg-main-new)] text-[var(--text-normal-new)]`} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <header
        className="chatbot-ui-fixed-header flex items-center justify-between px-3 py-2.5 shadow-sm"
      >
        <div className="flex items-center gap-2"> {/* Increased gap for RTL visual balance */}
          <Button variant="ghost" size="icon" onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="p-2 text-[var(--text-muted-new)] hover:bg-[var(--bg-input-new)]" aria-label={lang === 'he' ? "פתח/סגור תפריט" : "Toggle menu"} aria-expanded={isSidePanelOpen}>
            <Menu className="w-5 h-5" />
          </Button>
          {/* Visual Search Icon - Non-functional as per spec direction */}
          <Button variant="ghost" size="icon" title={lang === 'he' ? 'חיפוש (ויזואלי)' : 'Search (Visual)'} className="p-2 text-[var(--text-muted-new)] hover:bg-[var(--bg-input-new)] hidden md:flex">
            <Search className="w-5 h-5" />
          </Button>
        </div>

        {/* Center - Model Selector Placeholder from Gemini Spec (Visual Only) */}
        <div className="gemini-model-selector-placeholder hidden md:flex">
          <span className="gemini-model-name-placeholder">Gemini</span>
          <span className="gemini-model-version-tag-placeholder">Pro 2.5 (Preview)</span>
        </div>


        <div className="flex items-center gap-3"> {/* Increased gap */}
          <span className="text-[10px] font-medium text-[var(--text-muted-new)] uppercase hidden sm:inline">PRO</span>
          <Button variant="ghost" size="icon" onClick={() => setShowProfileModal(true)} title={lang === 'he' ? 'פרופיל' : 'Profile'} className="p-0">
             <div className="gemini-profile-icon-container">
                {getProfileInitial()}
                <span className="gemini-profile-online-dot"></span>
            </div>
          </Button>
           <Button
            variant="ghost"
            size="icon"
            onClick={() => changeLanguage(lang === 'he' ? 'en' : 'he')}
            title={lang === 'he' ? 'שנה שפה לאנגלית' : 'Change Language to Hebrew'}
            className="p-2 text-[var(--text-muted-new)] hover:bg-[var(--bg-input-new)]"
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
          currentNavPage={currentPage}
          navItems={navItemsConfig}
        />
        <main className="flex-1 flex flex-col overflow-y-auto bg-[var(--bg-main-new)]"> {/* Main content area takes remaining space */}
             { (showOnboarding || apiSettings.length === 0 || !apiSettings.some(s=>s.isValid)) ? (
                <div className="flex-1 flex items-center justify-center p-4">
                    <OnboardingWizard onComplete={handleCompleteOnboarding} />
                </div>
            ) : (
                renderPage()
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
        <DialogHeader className="bg-[var(--bg-sidebar-new)]"> {/* Match sidebar bg for consistency */}
            <DialogTitle>{lang === 'he' ? 'פרופיל והישגים' : 'Profile & Achievements'}</DialogTitle>
        </DialogHeader>
        <DialogContent className="p-6 space-y-4 bg-[var(--bg-main-new)]">
            {userProfile && (
                <>
                    <div>
                        <h3 className="text-lg font-medium text-[var(--text-normal-new)]">{userProfile.userName || (lang === 'he' ? 'משתמש' : 'User')}</h3>
                        <p className="text-sm text-[var(--text-muted-new)]">{lang === 'he' ? 'בוט:' : 'Bot:'} {userProfile.botName || 'LUMINA'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col items-center p-3 bg-[var(--bg-input-new)] border border-[var(--border-light-new)] rounded-md">
                            <Star className="w-7 h-7 text-yellow-500 mb-1.5"/>
                            <span className="text-xl font-medium text-[var(--text-normal-new)]">{userProfile.userXP || 0}</span>
                            <span className="text-xs text-[var(--text-muted-new)]">XP</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-[var(--bg-input-new)] border border-[var(--border-light-new)] rounded-md">
                            <Activity className="w-7 h-7 text-red-500 mb-1.5"/>
                            <span className="text-xl font-medium text-[var(--text-normal-new)]">{userProfile.dailyStreak || 0}</span>
                            <span className="text-xs text-[var(--text-muted-new)]">{lang === 'he' ? 'ימי רצף' : 'Day Streak'}</span>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium mb-1.5 text-[var(--text-normal-new)] text-sm">{lang === 'he' ? 'תגים שהושגו:' : 'Badges Earned:'}</h4>
                        {(userProfile.badges && userProfile.badges.length > 0) ? (
                            <ul className="space-y-1.5">
                                {userProfile.badges.map(badgeKey => (
                                    <li key={badgeKey} className="flex items-center gap-2 p-2 bg-[var(--bg-input-new)] border border-[var(--border-light-new)] rounded-md">
                                        {getBadgeIcon(badgeKey)}
                                        <span className="text-sm font-normal text-[var(--text-muted-new)]">{badgeDisplayNames[badgeKey]?.[lang as 'he' | 'en'] || badgeKey}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-[var(--text-muted-new)]">{lang === 'he' ? 'עדיין אין תגים. המשך להשתמש באפליקציה כדי להרוויח!' : 'No badges yet. Keep using the app to earn them!'}</p>
                        )}
                    </div>
                </>
            )}
        </DialogContent>
        <DialogFooter className="bg-[var(--bg-sidebar-new)]"> {/* Match sidebar bg */}
            <Button variant="outline" onClick={() => setShowProfileModal(false)}>{lang === 'he' ? 'סגור' : 'Close'}</Button>
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
