
import React from 'react';
import { Bot, User as UserIcon, Volume2, Copy,ThumbsUp, ThumbsDown, Share } from "lucide-react"; 
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
    
    // Alignment is handled by the parent flex container in ChatPage
    // const bubbleAlignmentClass = lang === 'he' 
    //     ? (isUser ? 'self-end' : 'self-start') 
    //     : (isUser ? 'self-start' : 'self-end'); // LTR: User left, Bot right

    const textAlignClass = lang === 'he'
        ? (isUser ? 'text-right' : 'text-left')
        : (isUser ? 'text-left' : 'text-right');


    const userBubbleStyle = "bg-[var(--bg-user-message-new)] text-[var(--text-normal-new)]"; 
    const botBubbleStyle = "bg-[var(--bg-bot-message-new)] text-[var(--text-normal-new)] border border-[var(--border-bot-message-new)]"; 
    
    const errorBubbleStyle = "bg-[var(--error)]/10 border border-[var(--error)] text-[var(--error)]";
    
    const bubbleClass = isUser ? userBubbleStyle : (message.isError ? errorBubbleStyle : botBubbleStyle);

    const chatFontSize = userProfile?.chatFontSize || 16; // Use global body font size from CSS vars later

    return (
        <div className={`flex w-full mb-4 message-appear ${isUser ? (lang === 'he' ? 'justify-end' : 'justify-start') : (lang === 'he' ? 'justify-start' : 'justify-end')}`}>
            <div 
                className={`max-w-[80%] p-3 shadow-sm ${bubbleClass}`} /* Increased max-width slightly */
                style={{ borderRadius: 'var(--message-border-radius, 18px)', /* Slightly more rounded */ }}
            >
                <p
                    className="whitespace-pre-wrap leading-relaxed"
                    style={{ fontSize: `${chatFontSize}px`}} 
                >
                    {message.content}
                </p>
                <div className={`text-xs mt-2 flex items-center ${isUser ? (lang === 'he' ? 'justify-start' : 'justify-end') : (lang === 'he' ? 'justify-end' : 'justify-start') }`}> {/* Timestamp alignment fixed for RTL */}
                    {!isUser && message.content && !message.isError && (
                         <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => onSpeak(message.content)} 
                            className="p-0.5 h-auto w-auto rounded-md text-[var(--text-muted-new)] hover:text-[var(--color-primary-new)] me-2" /* Margin for spacing */
                            aria-label={lang === 'he' ? "השמע הודעה" : "Speak message"}
                        >
                            <Volume2 className="w-3.5 h-3.5" />
                        </Button>
                    )}
                    <span className={`text-[var(--text-muted-new)] ${textAlignClass}`}>
                        {new Date(message.timestamp).toLocaleTimeString(lang === 'he' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                 {!isUser && !message.isError && (
                    <div className={`mt-2 pt-2 border-t border-[var(--border-bot-message-new)] flex items-center gap-1.5 ${lang === 'he' ? 'justify-end' : 'justify-start'}`}>
                        {[
                            { icon: Copy, label: lang === 'he' ? "העתק" : "Copy", action: () => navigator.clipboard.writeText(message.content) },
                            { icon: ThumbsUp, label: lang === 'he' ? "אהבתי" : "Like" },
                            { icon: ThumbsDown, label: lang === 'he' ? "לא אהבתי" : "Dislike" },
                            { icon: Share, label: lang === 'he' ? "שתף" : "Share" }
                        ].map((item, index) => (
                            <Button 
                                key={index} 
                                variant="ghost" 
                                size="icon" 
                                className="p-1.5 text-[var(--text-muted-new)] hover:bg-[var(--bg-input-new)] hover:text-[var(--color-primary-new)] h-auto w-auto" 
                                onClick={item.action}
                                aria-label={item.label}
                                title={item.label}
                            >
                                <item.icon className="w-4 h-4" />
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
