
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Paperclip, X, Plus, Sparkles, SendHorizontal, Loader2, Mic, MicOff, Palette, Brain as BrainIcon, MessageSquare } from "lucide-react"; 
import { useAppContext, ChatMessageItem } from '../../contexts/AppContext';
import { useUserSettings } from '../../contexts/UserSettingsContext';

import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
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
            content: response.message, 
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        recordTokenUsage(response.provider, response.modelId, response.usage.incomingTokens, response.usage.outgoingTokens, response.cost);
        setCurrentConversationCost(prev => prev + response.cost);
        setCurrentConversationTokens(prev => ({
            incoming: prev.incoming + response.usage.incomingTokens,
            outgoing: prev.outgoing + response.usage.outgoingTokens,
        }));

        if (continuousConversation) {
            speak(response.message, () => {
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
    <div className="flex flex-col h-full bg-[var(--bg-main-new)] relative overflow-hidden"> 
      {/* ChatPage does not have its own header anymore, global header is used */}
      
      <div className="flex-1 flex flex-col overflow-hidden"> 
            <div 
              aria-live="polite"
              className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin" /* Added scrollbar-thin */
              style={{ backgroundColor: 'var(--bg-main-new)' }} /* Ensure white background for chat content area */
            >
                {messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                         <h1 className="text-[56px] font-semibold mb-4" style={{
                             backgroundImage: `linear-gradient(to left, var(--gradient-start-new), var(--gradient-end-new))`,
                             WebkitBackgroundClip: 'text',
                             backgroundClip: 'text',
                             color: 'transparent'
                         }}>
                            {lang === 'he' ? `שלום, ${userProfile?.userName || 'משתמש'}!` : `Hello, ${userProfile?.userName || 'User'}!`}
                        </h1>
                        <p className="text-xl text-[var(--text-muted-new)]">
                            {lang === 'he' ? 'איך אוכל לעזור לך היום?' : 'How can I help you today?'}
                        </p>
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

            <div className="chatbot-ui-input-bar-container sticky">
                {attachedFiles.length > 0 && (
                    <div className="mb-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 px-1">
                        {attachedFiles.map(file => <FilePreview key={file.id} file={file} onRemove={() => removeAttachedFile(file.id)} />)}
                    </div>
                )}
                <form 
                    id="chat-form" 
                    onSubmit={handleSubmit} 
                    className="chatbot-ui-input-bar"
                >
                    <button type="button" onClick={() => fileInputRef.current?.click()} title={lang === 'he' ? 'צרף קובץ' : 'Attach File'} className="chatbot-ui-input-icon-button">
                        <Plus size={22}/> {/* Using Plus to match Gemini's visual for "add" */}
                    </button>
                    <button type="button" onClick={handleSpeechToText} title={lang === 'he' ? (isListening ? 'הפסק הקלטה' : 'הקלט קול') : (isListening ? 'Stop Listening' : 'Record Voice')} className={`chatbot-ui-input-icon-button ${isListening ? "text-[var(--error)]" : ""}`}>
                        {isListening ? <MicOff /> : <Mic />}
                    </button>
                    
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isListening ? (lang === 'he' ? "מאזין..." : "Listening...") : promptBarPlaceholderText}
                        disabled={isLoading}
                        className="chatbot-ui-input-bar-textarea"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        aria-label={lang === 'he' ? "הודעה" : "Message"}
                    />
                    
                    <div className="flex items-center gap-1.5 ml-2 flex-shrink-0 self-center"> {/* Use self-center for vertical alignment */}
                        <button type="button" title="Canvas (Visual)" className="chatbot-ui-input-icon-button hidden md:flex text-xs p-1.5 rounded-lg bg-[var(--bg-main-new)] hover:bg-[var(--border-light-new)] flex items-center gap-1">
                            <Palette size={18} /> 
                        </button>
                        <button type="button" title="Deep Research (Visual)" className="chatbot-ui-input-icon-button hidden md:flex text-xs p-1.5 rounded-lg bg-[var(--bg-main-new)] hover:bg-[var(--border-light-new)] flex items-center gap-1">
                            <BrainIcon size={18} />
                        </button>
                    </div>
                    
                    <button 
                        id="chat-submit-button" 
                        type="submit" 
                        disabled={isLoading || (!input.trim() && !transcript.trim() && attachedFiles.length === 0)} 
                        className={`chatbot-ui-send-button ${(isLoading || (!input.trim() && !transcript.trim() && attachedFiles.length === 0)) ? 'hidden' : ''}`}
                        aria-label={lang === 'he' ? "שלח" : "Send"}
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizontal className="w-5 h-5"/>}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                </form>
            </div>
      </div>
    </div>
  );
}
