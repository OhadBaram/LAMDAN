
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Paperclip, X, Plus, Sparkles, Send, Loader2, Mic, MicOff, Palette, Brain as BrainIcon, MessageSquare, Crown, Image as ImageIcon, ArrowRight } from "lucide-react"; 
import { useAppContext, ChatMessageItem } from '../../contexts/AppContext';
import { useUserSettings } from '../../contexts/UserSettingsContext';

import { Button } from '../../src/components/ui/Button';
import { Textarea } from '../../src/components/ui/Textarea';
import { ChatMessage } from './ChatMessage';
import { FilePreview } from './FilePreview';


const welcomeMessages = { 
    en: "Hello! How can I assist you today?",
    he: "שלום! איך אוכל לעזור היום?"
};


export function ChatPage() {
  const { lang, apiSettings, recordTokenUsage, speak, continuousConversation, setContinuousConversation, isListening, startListening, stopListening, transcript, setTranscript, clearTranscript, openErrorDialog, ChatHistoryStorage, InvokeLLM: InvokeLLMFromContext } = useAppContext(); 
  const { userProfile, activePersonaId, personas, activeSpaceId, spaces, incrementXP } = useUserSettings();

  const [currentChatId, setCurrentChatId] = useState(`chat-${Date.now()}`);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ id: string; name: string; type: string; dataUrl: string; content: string }>>([]);
  
  const [currentModelId, setCurrentModelId] = useState<string | null>(null);
  const [currentConversationCost, setCurrentConversationCost] = useState(0); 
  const [currentConversationTokens, setCurrentConversationTokens] = useState({ incoming: 0, outgoing: 0 }); 

  useEffect(() => {
    const loadHistory = async () => {
        const history = await ChatHistoryStorage.get(currentChatId);
        if (history && history.messages && history.messages.length > 0) {
            setMessages(history.messages);
            setCurrentConversationCost(history.cost || 0);
            setCurrentConversationTokens(history.tokens || { incoming: 0, outgoing: 0 });
        } else {
             setMessages([]); 
             setCurrentConversationCost(0);
             setCurrentConversationTokens({ incoming: 0, outgoing: 0 });
        }
    };
    loadHistory();
  }, [currentChatId, ChatHistoryStorage]);

  useEffect(() => {
      if (messages.length > 0) { 
          ChatHistoryStorage.upsert({ id: currentChatId, messages, cost: currentConversationCost, tokens: currentConversationTokens, lastUpdated: new Date().toISOString() });
      }
  }, [messages, currentConversationCost, currentConversationTokens, currentChatId, ChatHistoryStorage]);


  useEffect(() => {
    const defaultApiModel = apiSettings.find(s => s.isDefault && s.isValid) || apiSettings.find(s => s.isValid) || null;
    if (defaultApiModel) setCurrentModelId(defaultApiModel.id);
    else if (apiSettings.length > 0 && !apiSettings.some(s => s.isValid) && messages.length === 0) { 
      openErrorDialog(
        lang === 'he' ? "מודל לא תקין" : "Invalid Model", 
        lang === 'he' ? "אוי, נראה שאין מודל מאומת כרגע. אפשר לבדוק את ההגדרות או לבחור מודל אחר?" : "Oops, it seems there's no validated model selected. Could you check the settings or pick another one?"
      );
    }
  }, [apiSettings, lang, openErrorDialog, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = useCallback(async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const submissionInput = input.trim() || transcript.trim();
    if ((!submissionInput && attachedFiles.length === 0) || isLoading) return;

    const userMessageContent = submissionInput;
    const userMessage: ChatMessageItem = { role: "user", content: userMessageContent, timestamp: new Date().toISOString(), files: attachedFiles };
    setMessages(prev => [...prev, userMessage]);
    incrementXP(5); 

    setInput("");
    setAttachedFiles([]);
    clearTranscript();
    setIsLoading(true);

    const activeModelConfig = apiSettings.find(m => m.id === currentModelId);
    if (!activeModelConfig || !activeModelConfig.isValid) {
        openErrorDialog(lang === 'he' ? "בעיה עם המודל" : "Model Issue", lang === 'he' ? "אממ, המודל שנבחר לא זמין או לא תקין. אולי כדאי לבחור מודל אחר או לבדוק את ההגדרות?" : "Hmm, the selected model isn't available or valid. Perhaps select another model or check the settings?");
        setIsLoading(false);
        setMessages(prev => [...prev, {role: "assistant", content: lang === 'he' ? "שגיאה: אין מודל פעיל." : "Error: No active model.", timestamp: new Date().toISOString(), isError: true}]);
        return;
    }

    const currentPersona = personas.find(p => p.id === activePersonaId);
    const personaPrompt = currentPersona?.prompt || "";
    const systemPrompt = [userProfile?.systemPrompt, personaPrompt].filter(Boolean).join("\n\n");

    let fullPrompt = userMessageContent;
    const currentActiveSpace = spaces.find(s => s.id === activeSpaceId);
    const currentSpaceFilesContent = currentActiveSpace?.files?.map(f => `--- File: ${f.name} ---\n${f.content}\n--- End File ---`).join('\n\n') || '';

    if (activeSpaceId && currentSpaceFilesContent) {
        fullPrompt = `${userMessageContent}\n\n--- Relevant Context from Open Space "${currentActiveSpace?.name || 'current'}" ---\n${currentSpaceFilesContent}\n--- End of Context ---`;
    }
    
    const response = await InvokeLLMFromContext({ 
        modelConfig: activeModelConfig,
        prompt: fullPrompt,
        systemPrompt: systemPrompt,
        conversationHistory: messages.slice(-10), 
        files: attachedFiles,
    });

    setIsLoading(false);

    if (response.error) {
        openErrorDialog(lang === 'he' ? "שגיאת API" : "API Error", lang === 'he' ? `אוי לא, התקשורת עם ה-API נכשלה. הסיבה: ${response.error}. אולי לנסות שוב בעוד כמה רגעים?` : `Oh no, communication with the API failed. Reason: ${response.error}. Maybe try again in a few moments?`);
        const errorMessage: ChatMessageItem = { role: "assistant", content: `${lang === 'he' ? 'שגיאה: ' : 'Error: '}${response.error}`, timestamp: new Date().toISOString(), isError: true };
        setMessages(prev => [...prev, errorMessage]);
    } else {
        const assistantMessage: ChatMessageItem = { 
            role: "assistant", 
            content: response.message || '', 
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        if (response.usage && response.cost) {
            recordTokenUsage(response.provider || '', response.modelId || '', response.usage.incomingTokens || 0, response.usage.outgoingTokens || 0, response.cost);
            setCurrentConversationCost(prev => prev + response.cost);
            setCurrentConversationTokens(prev => ({
                incoming: prev.incoming + (response.usage?.incomingTokens || 0),
                outgoing: prev.outgoing + (response.usage?.outgoingTokens || 0),
            }));
        }

        if (continuousConversation) {
            speak(response.message || '', () => {
                if (continuousConversation && !isListening) {
                    startListening();
                }
            });
        }
    }
  },[input, transcript, attachedFiles, isLoading, currentModelId, activePersonaId, activeSpaceId, apiSettings, personas, userProfile, spaces, messages, lang, openErrorDialog, recordTokenUsage, speak, startListening, clearTranscript, continuousConversation, isListening, setInput, setAttachedFiles, setIsLoading, setMessages, setCurrentConversationCost, setCurrentConversationTokens, InvokeLLMFromContext, incrementXP ]);


  useEffect(() => {
    const trimmedTranscript = transcript.trim();
    if (trimmedTranscript && !isListening) {
        const currentInputVal = input; 
        setInput(prev => prev + trimmedTranscript);
        clearTranscript();
        if (continuousConversation) {
             const textToSubmit = (currentInputVal + trimmedTranscript).trim();
             if (textToSubmit || attachedFiles.length > 0) {
                handleSubmit();
             }
        }
    }
  }, [transcript, isListening, continuousConversation, clearTranscript, input, attachedFiles, handleSubmit, setInput]);

  const handleSpeechToText = () => {
      if (isListening) {
          stopListening();
      } else {
          clearTranscript();
          setInput(""); 
          startListening();
      }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const filesArray = Array.from(event.target.files);
    filesArray.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            let fileContent: string = "";
            const resultString = e.target?.result as string || "";

            if (file.type.startsWith('image/')) {
                fileContent = `Simulated OCR text from ${file.name}: "This image appears to show [describe general scene/subject]. Key elements include [element1], [element2], and [text snippet if any, e.g., 'EXIT sign']. The overall sentiment or purpose seems to be [e.g., informational, artistic, a snapshot]."`;
            } else if (file.type.startsWith('text/')) {
                 fileContent = resultString; 
            } else {
                fileContent = `(Unsupported file type for direct content extraction: ${file.name}. Basic file info might be available.)`;
            }
            setAttachedFiles(prev => [...prev, { id: `file-${Date.now()}-${Math.random()}`, name: file.name, type: file.type, dataUrl: resultString, content: fileContent }]);
        };

        if (file.type.startsWith('text/')) {
            reader.readAsText(file);
        } else { 
            reader.readAsDataURL(file); 
        }
    });
    if(event.target) event.target.value = '';
  };
  const removeAttachedFile = (fileId: string) => setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  
  const promptBarPlaceholderText = lang === 'he' 
    ? `שאל את ${userProfile?.botName || 'LUMINA'}...`
    : `Message ${userProfile?.botName || 'LUMINA'}...`;


  return (
    <div className="flex flex-col h-screen relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex-1 flex flex-col overflow-hidden"> 
            <div 
              aria-live="polite"
              className="flex-1 overflow-y-auto p-4 sm:p-6 fade-in"
              style={{ backgroundColor: 'var(--bg-primary)' }}
            >
                {messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center max-w-3xl mx-auto px-4">
                         {/* PRO Badge */}
                         <div className="flex items-center gap-2 mb-6">
                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold" style={{
                                background: 'var(--gradient-accent)',
                                color: 'white'
                            }}>
                                <Crown size={14} />
                                PRO
                            </div>
                        </div>

                        {/* Gemini-style greeting */}
                        <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                {lang === 'he' ? `שלום ${userProfile?.userName || 'אור'}` : `Hello ${userProfile?.userName || 'User'}`}
                                <span className="inline-block ml-2">✨</span>
                            </h1>
                            <h2 className="text-2xl md:text-3xl font-bold" style={{
                                background: 'var(--gradient-primary)',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                color: 'transparent'
                            }}>
                                {lang === 'he' ? 'ממה להתחיל?' : 'What shall we start with?'}
                            </h2>
                        </div>

                        {/* Gemini-style input bar */}
                        <div className="w-full max-w-2xl mb-6">
                            <div className="card-modern p-4" style={{ borderRadius: 'var(--radius-3xl)' }}>
                                {/* Input area */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-full border" style={{ 
                                        borderColor: 'var(--border)',
                                        background: 'var(--bg-tertiary)'
                                    }}>
                                        <Mic size={16} style={{ color: 'var(--text-secondary)' }} />
                                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            {lang === 'he' ? 'Pro' : 'Pro'}
                                        </span>
                                    </div>
                                    
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={lang === 'he' ? `יש לך שאלה ל-Gemini?` : 'Ask Gemini anything'}
                                        className="flex-1 bg-transparent border-none outline-none text-lg"
                                        style={{ color: 'var(--text-primary)' }}
                                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                            if (e.key === 'Enter' && !e.shiftKey && !isLoading && input.trim()) {
                                                e.preventDefault();
                                                handleSubmit(e);
                                            }
                                        }}
                                    />
                                    
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" style={{ color: 'var(--text-tertiary)' }}>
                                            <ImageIcon size={18} />
                                        </button>
                                        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" style={{ color: 'var(--text-tertiary)' }}>
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Bottom row with model selector and send */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border hover:bg-gray-50 transition-colors" style={{ 
                                            borderColor: 'var(--border)',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            <Sparkles size={14} />
                                            {lang === 'he' ? '2.5 Flash' : '2.5 Flash'}
                                        </button>
                                    </div>

                                    <button 
                                        onClick={() => input.trim() && handleSubmit()}
                                        disabled={!input.trim() || isLoading}
                                        className="p-3 rounded-full transition-all duration-200"
                                        style={{
                                            background: input.trim() ? 'var(--gradient-accent)' : 'var(--bg-tertiary)',
                                            color: input.trim() ? 'white' : 'var(--text-tertiary)',
                                            opacity: input.trim() ? 1 : 0.5,
                                            cursor: input.trim() ? 'pointer' : 'not-allowed'
                                        }}
                                    >
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Gemini-style pill buttons */}
                        <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
                            <button 
                                onClick={() => setInput(lang === 'he' ? "עזור לי לתכנן טיול" : "Help me plan a trip")}
                                className="px-4 py-2 rounded-full text-sm border hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            >
                                {lang === 'he' ? '✈️ עזור לי לתכנן טיול' : '✈️ Help me plan a trip'}
                            </button>
                            <button 
                                onClick={() => setInput(lang === 'he' ? "אני רוצה לתכנן משהו" : "I want to plan something")}
                                className="px-4 py-2 rounded-full text-sm border hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            >
                                {lang === 'he' ? '📅 אני רוצה לתכנן משהו' : '📅 I want to plan something'}
                            </button>
                            <button 
                                onClick={() => setInput(lang === 'he' ? "צור תמונה" : "Create an image")}
                                className="px-4 py-2 rounded-full text-sm border hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            >
                                {lang === 'he' ? '🎨 צור תמונה' : '🎨 Create an image'}
                            </button>
                            <button 
                                onClick={() => setInput(lang === 'he' ? "צור תזמורת" : "Create a playlist")}
                                className="px-4 py-2 rounded-full text-sm border hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            >
                                {lang === 'he' ? '🎵 צור תזמורת' : '🎵 Create a playlist'}
                            </button>
                            <button 
                                onClick={() => setInput(lang === 'he' ? "תן לי סיכום" : "Give me a summary")}
                                className="px-4 py-2 rounded-full text-sm border hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            >
                                {lang === 'he' ? '📝 תן לי סיכום' : '📝 Give me a summary'}
                            </button>
                        </div>
                    </div>
                )}

                {messages.map((message, index) =>
                    <ChatMessage
                        key={index}
                        message={message}
                        onSpeak={speak}
                    />
                )}
                 {isLoading && (
                    <div className="flex mb-3 message-appear ${lang === 'he' ? 'justify-start' : 'justify-end'}"> {/* Match ChatMessage structure */}
                        <div className="chatbot-ui-thinking-indicator"> {/* Use new thinking indicator style */}
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <span>{lang === 'he' ? 'חושב...' : 'Thinking...'}</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-ui-input-bar-container sticky bottom-0 p-4 fade-in" style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
                {attachedFiles.length > 0 && (
                    <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 px-1">
                        {attachedFiles.map(file => <FilePreview key={file.id} file={file} onRemove={() => removeAttachedFile(file.id)} />)}
                    </div>
                )}
                <form 
                    id="chat-form" 
                    onSubmit={handleSubmit} 
                    className="chatbot-ui-input-bar flex items-end gap-2"
                >
                    <div className="flex gap-2">
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()} 
                            title={lang === 'he' ? 'צרף קובץ' : 'Attach File'} 
                            className="btn-modern"
                            style={{ 
                                background: 'var(--bg-secondary)', 
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border)',
                                borderRadius: '50%',
                                width: '44px',
                                height: '44px',
                                padding: '0'
                            }}
                        >
                            <Plus size={20}/>
                        </button>
                        <button 
                            type="button" 
                            onClick={handleSpeechToText} 
                            title={lang === 'he' ? (isListening ? 'הפסק הקלטה' : 'הקלט קול') : (isListening ? 'Stop Listening' : 'Record Voice')} 
                            className="btn-modern"
                            style={{ 
                                background: isListening ? 'var(--error)' : 'var(--bg-secondary)', 
                                color: isListening ? 'white' : 'var(--text-primary)',
                                border: '1px solid var(--border)',
                                borderRadius: '50%',
                                width: '44px',
                                height: '44px',
                                padding: '0'
                            }}
                        >
                            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>
                    </div>
                    
                    <div className="flex-1 relative">
                        <Textarea
                            value={input}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                            placeholder={isListening ? (lang === 'he' ? "מאזין..." : "Listening...") : promptBarPlaceholderText}
                            disabled={isLoading}
                            className="chatbot-ui-input-bar-textarea"
                            rows={1}
                            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                                if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            aria-label={lang === 'he' ? "הודעה" : "Message"}
                        />
                        {transcript && (
                            <div className="absolute top-full left-0 right-0 mt-1 p-2 text-sm rounded-lg" style={{ 
                                background: 'var(--accent-light)', 
                                color: 'var(--text-primary)',
                                border: '1px solid var(--accent)'
                            }}>
                                {transcript}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button 
                            type="button" 
                            title="Canvas (Visual)" 
                            className="btn-modern hidden md:flex"
                            style={{ 
                                background: 'var(--bg-secondary)', 
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border)',
                                padding: '0.5rem'
                            }}
                        >
                            <Palette size={18} /> 
                        </button>
                        <button 
                            type="button" 
                            title="Deep Research (Visual)" 
                            className="btn-modern hidden md:flex"
                            style={{ 
                                background: 'var(--bg-secondary)', 
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border)',
                                padding: '0.5rem'
                            }}
                        >
                            <BrainIcon size={18} />
                        </button>
                    </div>
                    
                    <button 
                        id="chat-submit-button" 
                        type="submit" 
                        disabled={isLoading || (!input.trim() && !transcript.trim() && attachedFiles.length === 0)} 
                        className={`chatbot-ui-send-button ${(isLoading || (!input.trim() && !transcript.trim() && attachedFiles.length === 0)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{
                            opacity: (isLoading || (!input.trim() && !transcript.trim() && attachedFiles.length === 0)) ? 0.5 : 1,
                            cursor: (isLoading || (!input.trim() && !transcript.trim() && attachedFiles.length === 0)) ? 'not-allowed' : 'pointer'
                        }}
                        aria-label={lang === 'he' ? "שלח" : "Send"}
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="w-5 h-5"/>}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                </form>
            </div>
      </div>
    </div>
  );
}
