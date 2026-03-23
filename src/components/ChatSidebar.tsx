import React, { useState } from 'react';
import { MessageSquare, Plus, Search, Settings, Trash2, Edit3, Clock, Star } from 'lucide-react';

interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  isFavorite?: boolean;
}

export function ChatSidebar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [chats, setChats] = useState<ChatHistory[]>([
    {
      id: '1',
      title: 'פגישת צוות שבועית',
      lastMessage: 'הכנתי סיכום פגישה...',
      timestamp: '10:30',
      isFavorite: true
    },
    {
      id: '2', 
      title: 'רעיונות למוצר חדש',
      lastMessage: 'בוא נדבר על אינובציה...',
      timestamp: 'אתמול'
    },
    {
      id: '3',
      title: 'סקירת קוד',
      lastMessage: 'תוכל לבדוק את הפונקציה...',
      timestamp: 'שני'
    },
    {
      id: '4',
      title: 'תכנון טיול',
      lastMessage: 'מה הם המקומות הכי טובים...',
      timestamp: 'ראשון'
    }
  ]);

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 h-full flex flex-col card-modern" style={{ 
      background: 'var(--bg-secondary)', 
      borderLeft: '1px solid var(--border)',
      borderRadius: '0',
      boxShadow: 'var(--shadow-lg)'
    }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            היסטוריית שיחות
          </h2>
          <button className="btn-modern flex items-center gap-2" style={{ 
            background: 'var(--gradient-accent)', 
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow)'
          }}>
            <Plus size={20} />
            <span className="text-sm font-medium">צ'אט חדש</span>
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2" 
            size={16} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="חיפוש שיחות..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-modern pr-10"
            style={{ 
              background: 'var(--bg-primary)',
              fontSize: '0.875rem'
            }}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className="card-modern mb-2 cursor-pointer hover:scale-[1.02] transition-all duration-200"
            style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-lg)' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {chat.title}
                  </h3>
                  {chat.isFavorite && (
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                  {chat.lastMessage}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock size={12} style={{ color: 'var(--text-tertiary)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {chat.timestamp}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-1 mr-2">
                <button 
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <Edit3 size={14} />
                </button>
                <button 
                  className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t card-modern" style={{ borderColor: 'var(--border)', borderRadius: '0', borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}>
        <button className="btn-modern w-full flex items-center justify-center gap-2" style={{
          background: 'var(--gradient-accent)',
          color: 'white',
          padding: 'var(--spacing-sm) var(--spacing)',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow)'
        }}>
          <Settings size={16} />
          <span className="text-sm">הגדרות</span>
        </button>
      </div>
    </div>
  );
}
