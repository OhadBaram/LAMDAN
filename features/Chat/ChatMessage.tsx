
import React from 'react';
import { Bot, User as UserIcon, Volume2 } from "lucide-react";
import { useAppContext, ChatMessageItem } from '../../contexts/AppContext';
import { useUserSettings } from '../../contexts/UserSettingsContext';
import { Button } from '../../components/ui/Button';

interface ChatMessageProps {
    message: ChatMessageItem;
    onSpeak: (text: string) => void;
    onSuggestionClick?: (suggestionText: string) => void; 
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSpeak, onSuggestionClick }) => {
    const { lang, theme } = useAppContext(); 
    const { userProfile } = useUserSettings();
    const isUser = message.role === 'user';
    const alignClass = isUser ? 'justify-end' : 'justify-start';
    
    const bubbleBaseStyle = "max-w-xl md:max-w-2xl p-3 rounded-lg shadow-sm"; 
    
    // For Gemini-like light theme:
    // User bubble: Turquoise background, white text. (accent-secondary-light for bg)
    // Bot bubble: Very light gray background (bg-tertiary-light), primary text (dark gray)
    const userBubbleStyle = "bg-[var(--accent-secondary-light)] text-white"; 
    const botBubbleStyle = "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"; 
    
    const errorBubbleStyle = "bg-[var(--error)]/10 border border-[var(--error)] text-[var(--error)]";
    
    const bubbleClass = isUser ? userBubbleStyle : (message.isError ? errorBubbleStyle : botBubbleStyle);

    const profileImage = isUser ? userProfile?.userImage : userProfile?.botImage;
    // Profile icon is turquoise with white letter for user, default gray for bot.
    const ProfileIconComponent = isUser ? UserIcon : Bot;
    
    const userProfileIconClasses = "w-8 h-8 p-1.5 rounded-full gemini-profile-icon text-white flex-shrink-0 self-start"; // Uses the turquoise BG from CSS var
    const botProfileIconClasses = "w-8 h-8 p-1.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] flex-shrink-0 self-start";


    const showSpeaker = !isUser && message.content && onSpeak && !message.isError;
    const chatFontSize = userProfile?.chatFontSize || 16; // Font size as per new guidelines

    return (
        <div className={`flex items-end gap-2 mb-4 ${alignClass} message-appear`}>
            {!isUser && (
                profileImage ? 
                    <img src={profileImage} alt="Bot" className="w-8 h-8 rounded-full object-cover self-start flex-shrink-0"/> : 
                    <div className={botProfileIconClasses}><ProfileIconComponent className="w-full h-full" /></div>
            )}
            <div className={`${bubbleBaseStyle} ${bubbleClass}`}>
                <p
                    className={`whitespace-pre-wrap leading-relaxed`}
                    style={{ fontSize: `${chatFontSize}px`}} 
                >
                    {message.content}
                </p>
                <div className="text-xs mt-1.5 flex justify-between items-center">
                    <span className={isUser ? 'text-white/70' : (message.isError ? 'text-[var(--error)]/80' : 'text-[var(--text-secondary)]') }>
                        {new Date(message.timestamp).toLocaleTimeString(lang === 'he' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {showSpeaker && (
                        <Button size="icon" variant="ghost" onClick={() => onSpeak(message.content)} className={`p-1 h-auto w-auto rounded-md ${isUser ? 'text-white/70 hover:text-white' : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary-light)]'}`}>
                            <Volume2 className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>
                 {!isUser && !message.isError && message.suggestions && message.suggestions.length > 0 && onSuggestionClick && (
                    <div className="mt-2 pt-1.5 border-t border-[var(--border)] flex flex-wrap gap-1.5">
                        {message.suggestions.slice(0, 3).map((suggestion, idx) => (
                            <Button
                                key={idx}
                                variant="outline" 
                                size="sm"
                                className="text-xs !px-2 !py-1" // Ensure small, readable suggestions
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
                    <img src={profileImage || ''} alt={userProfile?.userName || 'User'} className="w-8 h-8 rounded-full object-cover self-start flex-shrink-0"/> : 
                    <div className={userProfileIconClasses}>{(userProfile?.userName || "U").charAt(0).toUpperCase()}</div>
            )}
        </div>
    );
}
