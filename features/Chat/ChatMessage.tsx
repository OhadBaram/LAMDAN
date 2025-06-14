import React from 'react';
import { Bot, User as UserIcon, Volume2 } from "lucide-react";
import { useAppContext, ChatMessageItem } from '../../contexts/AppContext';
import { useUserSettings } from '../../contexts/UserSettingsContext';
import { Button } from '../../components/ui/Button';

interface ChatMessageProps {
    message: ChatMessageItem;
    onSpeak: (text: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSpeak }) => {
    const { lang } = useAppContext();
    const { userProfile } = useUserSettings();
    const isUser = message.role === 'user';
    const alignClass = isUser ? 'justify-end' : 'justify-start';
    
    const bubbleBaseStyle = "max-w-xl md:max-w-2xl p-3.5 rounded-2xl shadow-md"; // rounded-xl to rounded-2xl
    const userBubbleStyle = "bg-indigo-500 text-white"; // bg-indigo-600, removed rounded-br-lg for global rounding
    const botBubbleStyle = "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600"; // Updated bot bubble style
    const errorBubbleStyle = "bg-red-100 dark:bg-red-800/60 border border-red-500 dark:border-red-600";
    
    const bubbleClass = isUser ? userBubbleStyle : botBubbleStyle;

    const profileImage = isUser ? userProfile?.userImage : userProfile?.botImage;
    const ProfileIcon = isUser ? UserIcon : Bot;
    const profileIconBg = isUser ? 'bg-slate-200 dark:bg-slate-600 text-slate-500' : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-500';

    const showSpeaker = !isUser && message.content && onSpeak && !message.isError;

    return (
        <div className={`flex items-end gap-2.5 mb-5 ${alignClass}`}>
            {!isUser && (
                profileImage ? 
                    <img src={profileImage} alt="Bot" className="w-9 h-9 rounded-full object-cover self-start flex-shrink-0"/> : 
                    <ProfileIcon className={`w-9 h-9 p-1.5 rounded-full self-start flex-shrink-0 ${profileIconBg}`} />
            )}
            <div className={`${bubbleBaseStyle} ${message.isError ? errorBubbleStyle : bubbleClass}`}>
                <p
                    className={`whitespace-pre-wrap leading-relaxed ${message.isError ? (isUser ? 'text-red-50' : 'text-red-700 dark:text-red-200') : ''}`}
                    style={{
                        fontSize: `${userProfile?.chatFontSize || 15}px`, 
                        color: isUser ? undefined : (message.isError ? undefined : (theme === 'dark' ? userProfile?.chatFontColor || '#e2e8f0' : userProfile?.chatFontColor || '#1e293b'))
                    }}
                >
                    {message.content}
                </p>
                <div className="text-xs mt-1.5 flex justify-between items-center">
                    <span className={isUser ? 'text-indigo-200' : (message.isError ? 'text-red-400 dark:text-red-500' : 'text-slate-400 dark:text-slate-500') }>
                        {new Date(message.timestamp).toLocaleTimeString(lang === 'he' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {showSpeaker && (
                        <Button size="icon" variant="ghost" onClick={() => onSpeak(message.content)} className="p-1 h-auto w-auto text-slate-500 hover:text-indigo-500 rounded-full">
                            <Volume2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
             {isUser && (
                profileImage ? 
                    <img src={profileImage || ''} alt={userProfile?.userName || 'User'} className="w-9 h-9 rounded-full object-cover self-start flex-shrink-0"/> : 
                    <ProfileIcon className={`w-9 h-9 p-1.5 rounded-full self-start flex-shrink-0 ${profileIconBg}`} />
            )}
        </div>
    );
}
// Helper to get theme, assuming userProfile might not always be up-to-date with global theme immediately
const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';