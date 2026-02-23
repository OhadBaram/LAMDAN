import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/Tabs";

export default function Home() {
  const [activeTab, setActiveTab] = useState('first');

  return (
    <div dir="rtl" className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-green-600 p-2 rounded-xl flex gap-2 justify-end">
            <TabsTrigger 
              value="first" 
              className="px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-700 text-white"
            >
              ראשון
            </TabsTrigger>
            <TabsTrigger 
              value="second"
              className="px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-700 text-white"
            >
              שני
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6 p-4 border rounded-lg shadow-sm">
            <TabsContent value="first">
              <h2 className="text-xl font-bold mb-2">לשונית ראשונה</h2>
              <p>כאן יוצג התוכן המרכזי של החלק הראשון.</p>
            </TabsContent>
            
            <TabsContent value="second">
              <h2 className="text-xl font-bold mb-2">לשונית שנייה</h2>
              <p>כאן יוצג התוכן המרכזי של החלק השני.</p>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}