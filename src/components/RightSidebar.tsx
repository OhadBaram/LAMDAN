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
    { id: 'gems', title: 'Gems', icon: <Crown size={18} />, isHeader: true },
    { id: 'brainstorm', title: 'כנמח פיתוחים', icon: <Zap size={18} /> },
    { id: 'cook', title: 'נונה רחבח', icon: <Database size={18} /> },
    { id: 'write', title: 'לחופר הסופר', icon: <FileText size={18} /> },
    { id: 'learn', title: 'מלמד רעיונות', icon: <Sparkles size={18} /> },
    { id: 'edit', title: 'מוגהר באנגלית', icon: <Type size={18} /> },
    { id: 'program', title: 'אוטומט על לחיצות מידע', icon: <Code size={18} /> },
    { id: 'images', title: 'מחולל תמונות', icon: <Image size={18} /> }
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
        <div className="p-4 border-b flex items-center justify-between card-modern" style={{ borderColor: 'var(--border)', borderRadius: '0', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
          <div className="flex items-center gap-2">
            {isPro && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold" style={{
                background: 'var(--gradient-accent)',
                color: 'white'
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
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Main Menu */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Top Actions */}
          <div className="space-y-2 mb-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] card-modern"
                style={{
                  background: activeSection === item.id ? 'var(--accent-light)' : 'var(--bg-secondary)',
                  color: activeSection === item.id ? 'var(--accent)' : 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: activeSection === item.id ? 'var(--shadow-glow)' : 'var(--shadow-sm)'
                }}
                onClick={() => setActiveSection(item.id)}
              >
                <div className={`p-2 rounded-lg ${
                  activeSection === item.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100'
                }`}>
                  {React.cloneElement(item.icon as React.ReactElement, {
                    size: 16,
                    color: activeSection === item.id ? 'white' : 'var(--text-secondary)'
                  })}
                </div>
                <div className="flex-1 text-right">
                  <div className="font-medium text-sm">{item.title}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Gems Section */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold mb-3 px-3" style={{ color: 'var(--text-tertiary)' }}>
              Gems
            </h3>
            <div className="space-y-1">
              {gemTools.map((tool) => (
                <button
                  key={tool.id}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: activeSection === tool.id ? 'var(--accent-light)' : 'transparent',
                    color: activeSection === tool.id ? 'var(--accent)' : 'var(--text-primary)'
                  }}
                  onClick={() => setActiveSection(tool.id)}
                >
                  <div className={`p-1.5 rounded-lg ${
                    activeSection === tool.id 
                      ? 'bg-blue-100' 
                      : 'bg-gray-100'
                  }`}>
                    {React.cloneElement(tool.icon as React.ReactElement, {
                      size: 14,
                      color: activeSection === tool.id ? 'var(--accent)' : 'var(--text-secondary)'
                    })}
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-sm">{tool.title}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Chats */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold mb-3 px-3 flex items-center justify-between" style={{ color: 'var(--text-tertiary)' }}>
              <span>שיחות אחרונות</span>
              <button className="text-xs" style={{ color: 'var(--accent)' }}>הצג הכל</button>
            </h3>
            <div className="space-y-1">
              {[
                { title: 'פגישת צוות שבועית', time: '10:30' },
                { title: 'רעיונות למוצר חדש', time: 'אתמול' },
                { title: 'סקירת קוד', time: 'שני' }
              ].map((chat, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-gray-100"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <div className="p-1.5 rounded-lg bg-gray-100">
                    <Clock size={14} style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                  <div className="flex-1 text-right min-w-0">
                    <div className="text-sm truncate">{chat.title}</div>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{chat.time}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="space-y-1">
            {bottomMenu.map((item) => (
              <button
                key={item.id}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: activeSection === item.id ? 'var(--accent-light)' : 'transparent',
                  color: activeSection === item.id ? 'var(--accent)' : 'var(--text-primary)'
                }}
                onClick={() => setActiveSection(item.id)}
              >
                <div className={`p-1.5 rounded-lg ${
                  activeSection === item.id 
                    ? 'bg-blue-100' 
                    : 'bg-gray-100'
                }`}>
                  {React.cloneElement(item.icon as React.ReactElement, {
                    size: 14,
                    color: activeSection === item.id ? 'var(--accent)' : 'var(--text-secondary)'
                  })}
                </div>
                <div className="flex-1 text-right">
                  <div className="text-sm">{item.title}</div>
                </div>
              </button>
            ))}
          </div>

          {/* User Info */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 px-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                background: 'var(--gradient-accent)',
                color: 'white'
              }}>
                <span className="text-xs font-bold">א</span>
              </div>
              <div className="flex-1 text-right">
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>אור משתמש</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>or@example.com</div>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-gray-100">
                <LogOut size={16} style={{ color: 'var(--text-tertiary)' }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
