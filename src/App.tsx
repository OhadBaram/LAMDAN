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

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div dir="rtl" className="min-h-screen bg-white">
      <div className="mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-green-600 p-2 flex gap-2 justify-end">
            <TabsTrigger 
              value="chat" 
              className="px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-700 text-white"
            >
              צ'אט
            </TabsTrigger>
            <TabsTrigger 
              value="agentarena"
              className="px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-700 text-white"
            >
              ארנת סוכנים
            </TabsTrigger>
            <TabsTrigger 
              value="arena"
              className="px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-700 text-white"
            >
              ארנה
            </TabsTrigger>
            <TabsTrigger 
              value="cockpit"
              className="px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-700 text-white"
            >
              קוקפיט
            </TabsTrigger>
            <TabsTrigger 
              value="knowledge"
              className="px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-700 text-white"
            >
              מקורות ידע
            </TabsTrigger>
            <TabsTrigger 
              value="spaces"
              className="px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-700 text-white"
            >
              ספייסים
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-700 text-white"
            >
              הגדרות
            </TabsTrigger>
          </TabsList>
          
          <div className="p-4">
            <TabsContent value="chat">
              <ChatPage />
            </TabsContent>
            
            <TabsContent value="agentarena">
              <AgentArenaPage />
            </TabsContent>
            
            <TabsContent value="arena">
              <ArenaPage />
            </TabsContent>
            
            <TabsContent value="cockpit">
              <CockpitPage />
            </TabsContent>
            
            <TabsContent value="knowledge">
              <KnowledgeBasePage />
            </TabsContent>
            
            <TabsContent value="spaces">
              <SpacesPage />
            </TabsContent>
            
            <TabsContent value="settings">
              <SettingsPage />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}