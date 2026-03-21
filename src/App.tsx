import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/Tabs";
import { ChatPage } from "../features/Chat/ChatPage";
import { AgentArenaPage } from "../features/AgentArena/AgentArenaPage";
import { ArenaPage } from "../features/Arena/ArenaPage";
import { CockpitPage } from "../features/Cockpit/CockpitPage";
import { KnowledgeBasePage } from "../features/KnowledgeBase/KnowledgeBasePage";
import { OnboardingWizard } from "../features/Onboarding/OnboardingWizard";
import { SettingsPage } from "../features/Settings/SettingsPage";
import { SpacesPage } from "../features/Spaces/SpacesPage";
import { ThemeToggle } from "./components/ThemeToggle";
import { MessageSquare, Brain as BrainIcon, Trophy, Gauge, Database, Layers, Settings as SettingsIcon } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat');

  const tabs = [
    { value: 'chat', label: 'צ\'אט', icon: MessageSquare },
    { value: 'agentarena', label: 'ארנת סוכנים', icon: BrainIcon },
    { value: 'arena', label: 'ארנה', icon: Trophy },
    { value: 'cockpit', label: 'קוקפיט', icon: Gauge },
    { value: 'knowledge', label: 'מקורות ידע', icon: Database },
    { value: 'spaces', label: 'ספייסים', icon: Layers },
    { value: 'settings', label: 'הגדרות', icon: SettingsIcon }
  ];

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <ThemeToggle />
      
      <div className="mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="tabs-modern sticky top-0 z-50 mb-4 fade-in" style={{ background: 'var(--bg-secondary)' }}>
            <div className="flex flex-wrap gap-2 justify-end w-full">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                    className="tab-modern flex items-center gap-2 px-4 py-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.charAt(0)}</span>
                  </TabsTrigger>
                );
              })}
            </div>
          </TabsList>
          
          <div className="p-4 fade-in">
            <TabsContent value="chat" className="fade-in">
              <ChatPage />
            </TabsContent>
            
            <TabsContent value="agentarena" className="fade-in">
              <AgentArenaPage />
            </TabsContent>
            
            <TabsContent value="arena" className="fade-in">
              <ArenaPage />
            </TabsContent>
            
            <TabsContent value="cockpit" className="fade-in">
              <CockpitPage />
            </TabsContent>
            
            <TabsContent value="knowledge" className="fade-in">
              <KnowledgeBasePage />
            </TabsContent>
            
            <TabsContent value="spaces" className="fade-in">
              <SpacesPage />
            </TabsContent>
            
            <TabsContent value="settings" className="fade-in">
              <SettingsPage />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}