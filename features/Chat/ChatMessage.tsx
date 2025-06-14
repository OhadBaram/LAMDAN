
import React from 'react';
import { Bot, User as UserIcon, Volume2 } from "lucide-react";
import { useAppContext, ChatMessageItem } from '../../contexts/AppContext';
import { useUserSettings } from '../../contexts/UserSettingsContext';
import { Button } from '../../components/ui/Button';

interface ChatMessageProps {
    message: ChatMessageItem;
    onSpeak: (text: string) => void;
    onSuggestionClick?: (suggestionText: string) => void; // For action suggestions
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSpeak, onSuggestionClick }) => {
    const { lang, theme } = useAppContext(); // Use theme from AppContext for correct color var resolution
    const { userProfile } = useUserSettings();
    const isUser = message.role === 'user';
    const alignClass = isUser ? 'justify-end' : 'justify-start';
    
    // Consistent padding and slightly less rounded corners to match ChatGPT
    const bubbleBaseStyle = "max-w-xl md:max-w-2xl p-3 rounded-lg shadow-sm"; 
    
    // User bubble: accent background, text-primary-light (white) for contrast
    // Bot bubble: secondary background, text-primary (theme dependent)
    const userBubbleStyle = "bg-[var(--accent)] text-[var(--text-primary-light)]"; 
    const botBubbleStyle = "bg-[var(--bg-secondary)] text-[var(--text-primary)]"; 
    
    // Error bubble: distinct error color, ensure text readable on it
    const errorBubbleStyle = "bg-[var(--error)]/20 border border-[var(--error)] text-[var(--error)]"; // Lighter bg, border, direct error text
    
    const bubbleClass = isUser ? userBubbleStyle : (message.isError ? errorBubbleStyle : botBubbleStyle);

    const profileImage = isUser ? userProfile?.userImage : userProfile?.botImage;
    const ProfileIcon = isUser ? UserIcon : Bot;
    
    // Profile icon background: subtle, using --border or a shade of --bg-primary
    const profileIconBg = isUser ? 'bg-[var(--border)] text-[var(--text-secondary)]' : 'bg-[var(--border)] text-[var(--accent)]';


    const showSpeaker = !isUser && message.content && onSpeak && !message.isError;

    // Chat font size from userProfile, default to 16px as per typography guide
    const chatFontSize = userProfile?.chatFontSize || 16;

    return (
        <div className={`flex items-end gap-2 mb-4 ${alignClass} message-appear`}>
            {!isUser && (
                profileImage ? 
                    <img src={profileImage} alt="Bot" className="w-8 h-8 rounded-md object-cover self-start flex-shrink-0"/> : 
                    <ProfileIcon className={`w-8 h-8 p-1.5 rounded-md self-start flex-shrink-0 ${profileIconBg}`} />
            )}
            <div className={`${bubbleBaseStyle} ${bubbleClass}`}>
                <p
                    className={`whitespace-pre-wrap leading-relaxed`}
                    style={{ fontSize: `${chatFontSize}px`}} // Font color handled by bubbleClass
                >
                    {message.content}
                </p>
                <div className="text-xs mt-1.5 flex justify-between items-center">
                    <span className={isUser ? 'text-[var(--text-primary-light)]/70' : (message.isError ? 'text-[var(--error)]/80' : 'text-[var(--text-secondary)]') }>
                        {new Date(message.timestamp).toLocaleTimeString(lang === 'he' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {showSpeaker && (
                        <Button size="icon" variant="ghost" onClick={() => onSpeak(message.content)} className="p-1 h-auto w-auto text-[var(--text-secondary)] hover:text-[var(--accent)] rounded-md">
                            <Volume2 className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>
                 {!isUser && !message.isError && message.suggestions && message.suggestions.length > 0 && onSuggestionClick && (
                    <div className="mt-2 pt-1.5 border-t border-[var(--border)] flex flex-wrap gap-1.5">
                        {message.suggestions.slice(0, 3).map((suggestion, idx) => (
                            <Button
                                key={idx}
                                variant="outline" // Will use bg-transparent border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]
                                size="sm"
                                className="text-xs !px-2 !py-1"
                                onClick={() => onSuggestionClick(suggestion)}
                            >
                                {suggestion}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
             {isUser && (
                profileImage ? 
                    <img src={profileImage || ''} alt={userProfile?.userName || 'User'} className="w-8 h-8 rounded-md object-cover self-start flex-shrink-0"/> : 
                    <ProfileIcon className={`w-8 h-8 p-1.5 rounded-md self-start flex-shrink-0 ${profileIconBg}`} />
            )}
        </div>
    );
}
