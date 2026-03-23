import React, { useState } from 'react';
import { 
  Info, Shield, Trash2, ExternalLink, ChevronRight, 
  Clock, Database, User, Settings as SettingsIcon, Bell, Moon, Globe
} from 'lucide-react';

export function LAMDANSettings() {
  const [personalContextEnabled, setPersonalContextEnabled] = useState(true);
  const [appActivityEnabled, setAppActivityEnabled] = useState(true);

  const settingsSections = [
    {
      id: 'personal-context',
      title: 'הקשר אישי',
      icon: <User size={20} />,
      content: (
        <div className="space-y-6">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            אפשר ל-LAMDAN למצוא תשובות מותאמות אישית לבקשות על ידי לימוד התחומים העדיפים שלך לדוגמה, כדי לשאול את LAMDAN איך להכין עוגה, צריך רק לומר לו לאפשר.
          </p>
          
          {/* Toggle 1 */}
          <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg" style={{ background: 'var(--accent-light)' }}>
                  <Database size={16} style={{ color: 'var(--accent)' }} />
                </div>
                <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                  זיכרון
                </span>
              </div>
              <p className="text-xs mr-8" style={{ color: 'var(--text-secondary)' }}>
                LAMDAN זוכר מידע חשוב כדי לתת לך תשובות טובות יותר, בהתאם להעדפות שלך. אפשר למחוק זיכרון או להפסיק לשמור בכל עת.
              </p>
              <div className="flex gap-3 mt-2 mr-8">
                <button className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                  נהל זיכרון →
                </button>
                <button className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                  מידע ופרטיות ←
                </button>
              </div>
            </div>
          <button
            onClick={() => setPersonalContextEnabled(!personalContextEnabled)}
            className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
              personalContextEnabled ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-gray-500/50'
            }`}
            style={{ boxShadow: personalContextEnabled ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none' }}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                personalContextEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
            </button>
          </div>

          {/* Toggle 2 */}
          <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg" style={{ background: 'var(--accent-light)' }}>
                  <Clock size={16} style={{ color: 'var(--accent)' }} />
                </div>
                <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                  פעילות באפליקציה
                </span>
              </div>
              <p className="text-xs mr-8" style={{ color: 'var(--text-secondary)' }}>
                LAMDAN שומר את הפעילות באפליקציה לצורך התאמת השירות לצרכיך ושיפור המוצר. אפשר לצפות ולמחוק את הפעילות, כולל תכנים ש-LAMDAN שומר לגביהם.
              </p>
              <div className="flex gap-3 mt-2 mr-8">
                <button className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                  פעילות באפליקציה ←
                </button>
              </div>
            </div>
            <button
              onClick={() => setAppActivityEnabled(!appActivityEnabled)}
              className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                appActivityEnabled ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-gray-500/50'
              }`}
              style={{ boxShadow: appActivityEnabled ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none' }}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  appActivityEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'appearance',
      title: 'מראה',
      icon: <Moon size={20} />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>מצב כהה</span>
            <button className="text-xs px-3 py-1.5 rounded-full border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              מערכת
            </button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>שפה</span>
            <button className="text-xs px-3 py-1.5 rounded-full border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              עברית
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'notifications',
      title: 'התראות',
      icon: <Bell size={20} />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>התראות דחיפה</span>
            <div className="w-10 h-5 bg-blue-500 rounded-full relative">
              <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>התראות אימייל</span>
            <div className="w-10 h-5 bg-gray-300 rounded-full relative">
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'privacy',
      title: 'מידע ופרטיות',
      icon: <Shield size={20} />,
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
              ניהול מידע אישי
            </h4>
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
              LAMDAN שומר מידע כדי לתת לך תשובות טובות יותר. אפשר לצפות ולמחוק את המידא.
            </p>
            <div className="flex gap-2">
              <button className="btn-modern text-sm px-4 py-2 rounded-lg" style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)'
              }}>
                נהל את המידע שלי
              </button>
              <button className="btn-modern text-sm px-4 py-2 rounded-lg" style={{
                background: 'var(--error)',
                color: 'white'
              }}>
                <Trash2 size={14} className="inline mr-1" />
                מחק הכל
              </button>
            </div>
          </div>
          
          <button className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>מדיניות פרטיות</span>
            <ExternalLink size={14} style={{ color: 'var(--text-tertiary)' }} />
          </button>
          
          <button className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>תנאי שימוש</span>
            <ExternalLink size={14} style={{ color: 'var(--text-tertiary)' }} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg" style={{ background: 'var(--accent-light)' }}>
            <SettingsIcon size={24} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              הגדרות
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              נהל את החשבון והעדפות שלך
            </p>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section) => (
            <div key={section.id} className="card-modern p-6" style={{ 
              borderRadius: 'var(--radius-2xl)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow)'
            }}>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="p-1.5 rounded-lg" style={{ background: 'var(--accent-light)' }}>
                  {React.cloneElement(section.icon as React.ReactElement, { 
                    size: 18, 
                    style: { color: 'var(--accent)' } 
                  })}
                </div>
                <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                  {section.title}
                </h2>
              </div>
              
              <div className="pr-12">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 p-6 rounded-2xl border text-center card-modern" style={{ 
          borderColor: 'var(--border)', 
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            LAMDAN מופעל על ידי Google AI. העדפות והמידע האישי שלך מוגנים.
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <button className="text-xs" style={{ color: 'var(--accent)' }}>מדיניות פרטיות</button>
            <button className="text-xs" style={{ color: 'var(--accent)' }}>תנאי שימוש</button>
            <button className="text-xs" style={{ color: 'var(--accent)' }}>עזרה</button>
          </div>
        </div>
      </div>
    </div>
  );
}
