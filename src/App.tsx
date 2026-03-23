import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/Tabs";
import { ChatPage } from "../features/Chat/ChatPage";
import { AgentArenaPage } from "../features/AgentArena/AgentArenaPage";
import { ArenaPage } from "../features/Arena/ArenaPage";
import { CockpitPage } from "../features/Cockpit/CockpitPage";
import { KnowledgeBasePage } from "../features/KnowledgeBase/KnowledgeBasePage";
import { OnboardingWizard } from "../features/Onboarding/OnboardingWizard";
import { LAMDANSettings } from "./components/LAMDANSettings";
import { SpacesPage } from "../features/Spaces/SpacesPage";
import { ThemeSelector } from "./components/ThemeSelector";
import { ChatSidebar } from "./components/ChatSidebar";
import { ModernHomeScreen } from "./components/ModernHomeScreen";
import { RightSidebar } from "./components/RightSidebar";
import { MessageSquare, Brain as BrainIcon, Trophy, Gauge, Database, Layers, Settings as SettingsIcon, Menu, X, Sparkles } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  const tabs = [
    { value: 'home', label: 'בית', icon: MessageSquare },
    { value: 'chat', label: 'צ\'אט', icon: MessageSquare },
    { value: 'agentarena', label: 'ארנת סוכנים', icon: BrainIcon },
    { value: 'arena', label: 'ארנה', icon: Trophy },
    { value: 'cockpit', label: 'קוקפיט', icon: Gauge },
    { value: 'knowledge', label: 'מקורות ידע', icon: Database },
    { value: 'spaces', label: 'ספייסים', icon: Layers },
    { value: 'settings', label: 'הגדרות', icon: SettingsIcon }
  ];

  return (
    <div dir="rtl" data-theme="dark" className="min-h-screen flex page-transition" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* LAMDAN Header */}
      <div className="fixed top-0 right-0 left-0 z-[100] flex items-center justify-between px-4 py-3" style={{ 
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* LAMDAN Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold" style={{ 
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}>
            LAMDAN
          </span>
          <Sparkles size={20} style={{ color: 'var(--accent)' }} />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Theme Selector */}
          <ThemeSelector />
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-row min-w-0 pt-[60px]">
        {/* Right Sidebar */}
        <RightSidebar 
          isOpen={rightSidebarOpen} 
          onClose={() => setRightSidebarOpen(false)} 
        />

        {/* Left Sidebar */}
        <div className={`fixed lg:relative lg:translate-x-0 transition-transform duration-300 z-30 h-full ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}>
          <ChatSidebar />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navigation */}
          <div className="sticky top-0 z-30 fade-in" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
            <div className="max-w-6xl mx-auto px-4 py-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="tabs-modern w-full">
                  <div className="flex flex-wrap gap-2 justify-end w-full">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <TabsTrigger 
                          key={tab.value}
                          value={tab.value} 
                          className="tab-modern flex items-center gap-2 px-4 py-3 font-semibold text-sm"
                        >
                          <Icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{tab.label}</span>
                          <span className="sm:hidden">{tab.label.charAt(0)}</span>
                        </TabsTrigger>
                      );
                    })}
                  </div>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="home" className="h-full fade-in">
                <ModernHomeScreen />
              </TabsContent>
              
              <TabsContent value="chat" className="h-full fade-in">
                <ChatPage />
              </TabsContent>
              
              <TabsContent value="agentarena" className="h-full fade-in">
                <AgentArenaPage />
              </TabsContent>
              
              <TabsContent value="arena" className="h-full fade-in">
                <ArenaPage />
              </TabsContent>
              
              <TabsContent value="cockpit" className="h-full fade-in">
                <CockpitPage />
              </TabsContent>
              
              <TabsContent value="knowledge" className="h-full fade-in">
                <KnowledgeBasePage />
              </TabsContent>
              
              <TabsContent value="spaces" className="h-full fade-in">
                <SpacesPage />
              </TabsContent>
              
              <TabsContent value="settings" className="h-full fade-in">
                <LAMDANSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}