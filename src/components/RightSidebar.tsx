import React, { useState } from 'react';
import { 
  X, Settings, History, Sparkles, Image, Code, Music, 
  FileText, Globe, Palette, Moon, Sun, Type, Volume2, 
  Shield, HelpCircle, LogOut, ChevronRight, ChevronLeft,
  Crown, Zap, Database, Bookmark, Clock, Star
} from 'lucide-react';

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RightSidebar({ isOpen, onClose }: RightSidebarProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(true);

  const menuItems = [
    {
      id: 'chat-history',
      title: 'שיחות חדשות',
      icon: <Sparkles size={18} />,
      description: 'התחל שיחה חדשה'
    },
    {
      id: 'history',
      title: 'הדיבורים שלי',
      icon: <History size={18} />,
      description: 'היסטוריית שיחות'
    }
  ];

  const gemTools = [
    { id: 'gems', title: 'LAMDAN', icon: <Crown size={18} />, isHeader: true },
    { id: 'brainstorm', title: 'סיעור מוחות', icon: <Zap size={18} /> },
    { id: 'cook', title: 'מתכונים', icon: <Database size={18} /> },
    { id: 'write', title: 'כתיבת תוכן', icon: <FileText size={18} /> },
    { id: 'learn', title: 'למידה', icon: <Sparkles size={18} /> },
    { id: 'edit', title: 'עריכה', icon: <Type size={18} /> },
    { id: 'program', title: 'תכנות', icon: <Code size={18} /> },
    { id: 'images', title: 'תמונות', icon: <Image size={18} /> }
  ];

  const bottomMenu = [
    { id: 'markdown', title: 'Markdown', icon: <Code size={18} /> },
    { id: 'saved', title: 'צ׳אטים', icon: <Bookmark size={18} /> },
    { id: 'clock', title: 'לוח שנה', icon: <Clock size={18} /> },
    { id: 'settings', title: 'הגדרות', icon: <Settings size={18} /> },
    { id: 'help', title: 'עזרה', icon: <HelpCircle size={18} /> }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:static lg:w-72'
      }`} style={{ 
        background: 'var(--bg-primary)',
        borderRight: '1px solid var(--border)',
        boxShadow: isOpen ? 'var(--shadow-2xl)' : 'none'
      }}>
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between card-modern" style={{ 
          borderColor: 'var(--border)', 
          borderRadius: '0', 
          borderTop: 'none', 
          borderLeft: 'none', 
          borderRight: 'none',
          background: 'var(--bg-secondary)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div className="flex items-center gap-2">
            {isPro && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold" style={{
                background: 'var(--gradient-accent)',
                color: 'white',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <Crown size={12} />
                PRO
              </div>
            )}
          </div>
          
          <button 
            onClick={onClose}
            className="lg:hidden btn-modern p-2"
            style={{ 
              background: 'var(--bg-primary)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)'
            }}
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Main Menu */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Top Actions */}
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-[1.02] card-modern group"
                style={{
                  background: activeSection === item.id ? 'var(--accent-light)' : 'var(--bg-secondary)',
                  color: activeSection === item.id ? 'var(--accent)' : 'var(--text-primary)',
                  border: '1px solid',
                  borderColor: activeSection === item.id ? 'var(--accent)' : 'var(--border)',
                  boxShadow: activeSection === item.id ? 'var(--shadow-glow)' : 'var(--shadow-sm)'
                }}
                onClick={() => setActiveSection(item.id)}
              >
                <div className={`p-2.5 rounded-xl transition-colors duration-300 ${
                  activeSection === item.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100/50 border border-gray-200/50 group-hover:bg-gray-100'
                }`}>
                  {React.cloneElement(item.icon as React.ReactElement, {
                    size: 18,
                    color: activeSection === item.id ? 'white' : 'var(--text-secondary)'
                  })}
                </div>
                <div className="flex-1 text-right">
                  <div className="font-bold text-sm tracking-tight">{item.title}</div>
                  <div className="text-[10px] opacity-60 font-medium">{item.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Gems Section */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider px-2 flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              LAMDAN
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {gemTools.map((tool) => (
                <button
                  key={tool.id}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-white/10 border border-transparent group"
                  style={{
                    background: activeSection === tool.id ? 'var(--accent-light)' : 'transparent',
                    color: activeSection === tool.id ? 'var(--accent)' : 'var(--text-primary)',
                  }}
                  onClick={() => setActiveSection(tool.id)}
                >
                  <div className={`p-2 rounded-lg transition-all duration-200 ${
                    activeSection === tool.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100/30 group-hover:bg-gray-100/50'
                  }`}>
                    {React.cloneElement(tool.icon as React.ReactElement, {
                      size: 14,
                      color: activeSection === tool.id ? 'white' : 'var(--text-secondary)'
                    })}
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-xs font-bold">{tool.title}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Chats */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider px-2 flex items-center justify-between" style={{ color: 'var(--text-tertiary)' }}>
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                שיחות אחרונות
              </span>
              <button className="text-[10px] font-bold hover:underline" style={{ color: 'var(--accent)' }}>הצג הכל</button>
            </h3>
            <div className="space-y-2">
              {[
                { title: 'פגישת צוות שבועית', time: '10:30' },
                { title: 'רעיונות למוצר חדש', time: 'אתמול' },
                { title: 'סקירת קוד', time: 'שני' }
              ].map((chat, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-md border border-gray-50 group"
                  style={{ 
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)' 
                  }}
                >
                  <div className="p-2 rounded-lg bg-white border border-gray-100">
                    <Clock size={14} style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                  <div className="flex-1 text-right min-w-0">
                    <div className="text-xs font-bold truncate">{chat.title}</div>
                    <div className="text-[10px] opacity-50 font-medium">{chat.time}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <div className="grid grid-cols-2 gap-2">
            {bottomMenu.slice(0, 4).map((item) => (
              <button
                key={item.id}
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all duration-200 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100"
                style={{
                  background: activeSection === item.id ? 'var(--accent-light)' : 'var(--bg-primary)',
                  color: activeSection === item.id ? 'var(--accent)' : 'var(--text-primary)'
                }}
                onClick={() => setActiveSection(item.id)}
              >
                <div className={`p-2 rounded-xl ${
                  activeSection === item.id ? 'bg-blue-500 text-white' : 'bg-gray-50'
                }`}>
                  {React.cloneElement(item.icon as React.ReactElement, {
                    size: 16,
                    color: activeSection === item.id ? 'white' : 'var(--text-secondary)'
                  })}
                </div>
                <span className="text-[10px] font-bold">{item.title}</span>
              </button>
            ))}
          </div>

          {/* User Info Card */}
          <div className="p-3 rounded-2xl border bg-white shadow-sm flex items-center gap-3 group transition-all duration-300 hover:shadow-md" style={{ borderColor: 'var(--border)' }}>
            <div className="relative">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm" style={{
                background: 'var(--gradient-accent)',
                color: 'white',
                boxShadow: 'var(--shadow-sm)'
              }}>
                א
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
            </div>
            <div className="flex-1 text-right overflow-hidden">
              <div className="text-xs font-black truncate" style={{ color: 'var(--text-primary)' }}>אור משתמש</div>
              <div className="text-[10px] font-bold truncate opacity-50">or@example.com</div>
            </div>
            <button className="p-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors duration-200 text-gray-400">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
