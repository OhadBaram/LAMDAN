
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
    const bubbleClass = isUser ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none';

    const profileImage = isUser ? userProfile?.userImage : userProfile?.botImage;
    const showSpeaker = !isUser && message.content && onSpeak && !message.isError;

    return (
        <div className={`flex items-end gap-2 mb-4 ${alignClass}`}>
            {!isUser && (
                profileImage ? <img src={profileImage} alt="Bot" className="w-8 h-8 rounded-full object-cover"/> : <Bot className="w-8 h-8 text-indigo-500 p-1 bg-indigo-100 dark:bg-indigo-900 rounded-full" />
            )}
            <div className={`max-w-xl md:max-w-2xl p-3 rounded-xl shadow-md ${bubbleClass} ${message.isError ? 'bg-red-100 dark:bg-red-900/50 border border-red-500 dark:border-red-700' : ''}`}>
                <p
                    className={`whitespace-pre-wrap ${message.isError ? (isUser ? 'text-red-50' : 'text-red-700 dark:text-red-200') : ''}`}
                    style={{
                        fontSize: `${userProfile?.chatFontSize || 14}px`,
                        color: isUser ? undefined : (message.isError ? undefined : userProfile?.chatFontColor)
                    }}
                >
                    {message.content}
                </p>
                <div className="text-xs mt-1 flex justify-between items-center">
                    <span className={isUser ? 'text-indigo-200' : (message.isError ? 'text-red-400 dark:text-red-500' : 'text-gray-400 dark:text-gray-500') }>
                        {new Date(message.timestamp).toLocaleTimeString(lang === 'he' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {showSpeaker && (
                        <Button size="icon" variant="ghost" onClick={() => onSpeak(message.content)} className="p-1 h-auto w-auto text-gray-500 hover:text-indigo-500">
                            <Volume2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
             {isUser && (
                profileImage ? <img src={profileImage || ''} alt={userProfile?.userName || 'User'} className="w-8 h-8 rounded-full object-cover"/> : <UserIcon className="w-8 h-8 text-gray-500 p-1 bg-gray-100 dark:bg-gray-600 rounded-full" />
            )}
        </div>
    );
}
