import React, { useState } from 'react';
import { Brain, Image, Code, Music, FileText, Globe, Sparkles, ArrowRight } from 'lucide-react';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  isNew?: boolean;
  isPro?: boolean;
}

export function ModernHomeScreen() {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const features: FeatureCard[] = [
    {
      id: 'ai-assistant',
      title: 'AI Assistant',
      description: 'שוחח עם בינה מלאכותית חכמה',
      icon: <Brain size={32} />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      isNew: true
    },
    {
      id: 'image-generator',
      title: 'Image Generator',
      description: 'צור תמונות מדהימות בלחיצת כפתור',
      icon: <Image size={32} />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      isPro: true
    },
    {
      id: 'code-helper',
      title: 'Code Helper',
      description: 'עזרה תכנותית והסבר קוד',
      icon: <Code size={32} />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      id: 'music-creator',
      title: 'Music Creator',
      description: 'צור מוזיקה וסאונדים',
      icon: <Music size={32} />,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      isNew: true
    },
    {
      id: 'document-writer',
      title: 'Document Writer',
      description: 'כתיבת מסמכים ומאמרים',
      icon: <FileText size={32} />,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      id: 'web-explorer',
      title: 'Web Explorer',
      description: 'חקור וגלה מידע ברחבי הרשת',
      icon: <Globe size={32} />,
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      isPro: true
    }
  ];

  const recentActivities = [
    { title: 'סיכום פגישת צוות', time: 'לפני 10 דקות', icon: <FileText size={16} /> },
    { title: 'קוד JavaScript', time: 'לפני שעה', icon: <Code size={16} /> },
    { title: 'תמונת נוף', time: 'לפני 3 שעות', icon: <Image size={16} /> }
  ];

  return (
    <div className="flex-1 flex flex-col h-full" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ 
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}>
              ברוכים הבאים!
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              בחרו כלי והתחילו ליצור
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full text-xs font-medium" style={{
              background: 'var(--success)',
              color: 'white'
            }}>
              PRO
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card-modern text-center" style={{ padding: 'var(--spacing)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>24</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>שיחות היום</div>
          </div>
          <div className="card-modern text-center" style={{ padding: 'var(--spacing)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--success)' }}>156</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>יצירות</div>
          </div>
          <div className="card-modern text-center" style={{ padding: 'var(--spacing)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--warning)' }}>2.3k</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>טוקנים</div>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="flex-1 overflow-y-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`card-modern cursor-pointer transition-all duration-300 ${
                activeCard === feature.id ? 'ring-2 scale-105' : 'hover:scale-[1.02]'
              }`}
              style={{
                background: feature.gradient,
                color: 'white',
                padding: 'var(--spacing-lg)',
                position: 'relative',
                overflow: 'hidden',
                ringColor: activeCard === feature.id ? 'rgba(255,255,255,0.5)' : 'transparent'
              }}
              onClick={() => setActiveCard(feature.id)}
              onMouseEnter={() => setActiveCard(feature.id)}
              onMouseLeave={() => setActiveCard(null)}
            >
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-black bg-opacity-20" />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  {feature.icon}
                  <div className="flex gap-1">
                    {feature.isNew && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
                        NEW
                      </span>
                    )}
                    {feature.isPro && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500 text-black">
                        PRO
                      </span>
                    )}
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm opacity-90 mb-3">{feature.description}</p>
                
                <button className="flex items-center gap-1 text-sm font-medium bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded-lg transition-all">
                  התחל <ArrowRight size={14} />
                </button>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white opacity-10" />
              <div className="absolute -bottom-2 -left-2 w-12 h-12 rounded-full bg-white opacity-10" />
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            פעילות אחרונה
          </h3>
          <div className="space-y-2">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="card-modern flex items-center gap-3 p-3 cursor-pointer hover:scale-[1.01]"
                style={{ borderRadius: 'var(--radius-lg)' }}
              >
                <div className="p-2 rounded-lg" style={{ 
                  background: 'var(--accent-light)', 
                  color: 'var(--accent)' 
                }}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    {activity.title}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {activity.time}
                  </div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--text-tertiary)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex gap-2">
          <button className="btn-modern flex-1 flex items-center justify-center gap-2" style={{
            background: 'var(--gradient-accent)',
            color: 'white'
          }}>
            <Sparkles size={16} />
            צ'אט חדש
          </button>
          <button className="btn-modern flex items-center justify-center gap-2" style={{
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)'
          }}>
            <Globe size={16} />
            חקור
          </button>
        </div>
      </div>
    </div>
  );
}
