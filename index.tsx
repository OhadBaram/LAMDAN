import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/Tabs";

export default function Home() {
  const [activeTab, setActiveTab] = useState('first');

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#fff' }}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList style={{
          justifyContent: 'flex-end',
          direction: 'rtl',
          width: '100%',
          gap: '8px',
          background: '#4CAF50',
          borderRadius: '12px',
        }}>
          <TabsTrigger value="first">ראשון</TabsTrigger>
          <TabsTrigger value="second">שני</TabsTrigger>
        </TabsList>
        <TabsContent value="first">תוכן הלשונית הראשונה</TabsContent>
        <TabsContent value="second">תוכן הלשונית השנייה</TabsContent>
      </Tabs>
    </div>
  );
}
