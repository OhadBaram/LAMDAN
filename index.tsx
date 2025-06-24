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
          padding: '6px'
        }}>
          <TabsTrigger value="first">שיחה חדשה</TabsTrigger>
          <TabsTrigger value="second">חיפוש שיחות</TabsTrigger>
          <TabsTrigger value="third">ספריה</TabsTrigger>
          {/* הוסף כאן לשוניות נוספות בעברית בלבד */}
        </TabsList>
        <TabsContent value="first">
          כאן מתחילים שיחה חדשה.
        </TabsContent>
        <TabsContent value="second">
          כאן מחפשים שיחות קודמות.
        </TabsContent>
        <TabsContent value="third">
          כאן מוצגת הספריה שלך.
        </TabsContent>
      </Tabs>
    </div>
  );
}
