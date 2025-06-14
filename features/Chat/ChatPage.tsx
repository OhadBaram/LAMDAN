
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Paperclip, X, Plus, Sparkles, SendHorizontal, Loader2, Mic, MicOff, Info, MessageCircle, Palette, Brain as BrainIcon } from "lucide-react"; 
import { useAppContext, ChatMessageItem, InvokeLLM } from '../../contexts/AppContext';
import { useUserSettings } from '../../contexts/UserSettingsContext';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Label } from '../../components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'; 
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../../components/ui/Dialog';
import { Select } from '../../components/ui/Select';
import { Switch } from '../../components/ui/Switch';

import { ChatMessage } from './ChatMessage';
import { FilePreview } from './FilePreview';

const thinkingMessages = {
    en: [
        "LUMINA is thinking...",
        "Crafting a response...",
        "Analyzing your query...",
        "Just a moment...",
        "Processing...",
        "Gathering insights..."
    ],
    he: [
        "LUMINA חושבת...",
        "מנסחת תשובה...",
        "מנתחת את השאלה שלך...",
        "רק רגע...",
        "מעבדת...",
        "אוספת תובנות..."
    ]
};

const welcomeMessages = { // Used for initial bot message if history is empty, and prompt bar placeholder
    en: [
        "Hello! How can I assist you today?",
        "Hi there! What can LUMINA do for you?",
        "Welcome! Ask me anything.",
        "Ready for your questions!"
    ],
    he: [
        "שלום! איך אוכל לעזור היום?",
        "היי! מה LUMINA יכולה לעשות בשבילך?",
        "ברוכים הבאים! אפשר לשאול אותי כל דבר.",
        "מוכנה לשאלות שלך!"
    ]
};

// Prompt starters are removed from below input, will be part of the empty chat state message if desired.
// For now, the large welcome message replaces them in empty state.

export function ChatPage() {
  const { lang, apiSettings, recordTokenUsage, speak, continuousConversation, setContinuousConversation, isListening, startListening, stopListening, transcript, setTranscript, clearTranscript, openErrorDialog, ChatHistoryStorage, InvokeLLM: InvokeLLMFromContext } = useAppContext(); 
  const { userProfile, activePersonaId, personas, activeSpaceId, spaces, savedPrompts, incrementXP } = useUserSettings();

  const [currentChatId, setCurrentChatId] = useState(`chat-${Date.now()}`);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ id: string; name: string; type: string; dataUrl: string; content: string }>>([]);
  const [showSavedPromptsDialog, setShowSavedPromptsDialog] = useState(false);
  const [isChatInfoPanelOpen, setIsChatInfoPanelOpen] = useState(false); 

  const [currentModelId, setCurrentModelId] = useState<string | null>(null);
  const [currentConversationCost, setCurrentConversationCost] = useState(0);
  const [currentConversationTokens, setCurrentConversationTokens] = useState({ incoming: 0, outgoing: 0 });
  const [currentThinkingMessage, setCurrentThinkingMessage] = useState("");

  const getRandomMessage = (messageArray: string[]) => messageArray[Math.floor(Math.random() * messageArray.length)];

  useEffect(() => {
    const loadHistory = async () => {
        const history = await ChatHistoryStorage.get(currentChatId);
        if (history && history.messages && history.messages.length > 0) {
            setMessages(history.messages);
            setCurrentConversationCost(history.cost || 0);
            setCurrentConversationTokens(history.tokens || { incoming: 0, outgoing: 0 });
        } else {
             // Initial bot message logic is simplified. The large welcome text handles the empty state visually.
             // We can still add a default bot greeting if needed, or rely on the user starting.
             // For now, let's keep it clean for the new UI.
             setMessages([]); 
             setCurrentConversationCost(0);
             setCurrentConversationTokens({ incoming: 0, outgoing: 0 });
        }
    };
    loadHistory();
  }, [currentChatId, lang, ChatHistoryStorage]);

  useEffect(() => {
      // Save if there are any messages (user or bot)
      if (messages.length > 0) { 
          ChatHistoryStorage.upsert({ id: currentChatId, messages, cost: currentConversationCost, tokens: currentConversationTokens, lastUpdated: new Date().toISOString() });
      }
  }, [messages, currentConversationCost, currentConversationTokens, currentChatId, ChatHistoryStorage, lang]);


  useEffect(() => {
    const defaultApiModel = apiSettings.find(s => s.isDefault && s.isValid) || apiSettings.find(s => s.isValid) || null;
    if (defaultApiModel) setCurrentModelId(defaultApiModel.id);
    else if (apiSettings.length > 0 && !apiSettings.some(s => s.isValid)) {
      openErrorDialog(
        lang === 'he' ? "מודל לא תקין" : "Invalid Model", 
        lang === 'he' ? "אוי, נראה שאין מודל מאומת כרגע. אפשר לבדוק את ההגדרות או לבחור מודל אחר?" : "Oops, it seems there's no validated model selected. Could you check the settings or pick another one?"
      );
    }
  }, [apiSettings, lang, openErrorDialog]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isLoading) {
        const intervalId = setInterval(() => {
            setCurrentThinkingMessage(getRandomMessage(thinkingMessages[lang as 'he' | 'en']));
        }, 2500);
        setCurrentThinkingMessage(getRandomMessage(thinkingMessages[lang as 'he' | 'en'])); 
        return () => clearInterval(intervalId);
    }
  }, [isLoading, lang]);

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
        openErrorDialog(
            lang === 'he' ? "בעיה עם המודל" : "Model Issue", 
            lang === 'he' ? "אממ, המודל שנבחר לא זמין או לא תקין. אולי כדאי לבחור מודל אחר או לבדוק את ההגדרות?" : "Hmm, the selected model isn't available or valid. Perhaps select another model or check the settings?"
        );
        setIsLoading(false);
        setMessages(prev => prev.slice(0, -1)); 
        return;
    }

    const currentPersona = personas.find(p => p.id === activePersonaId);
    const personaPrompt = currentPersona?.prompt || "";
    const systemPrompt = [userProfile?.systemPrompt, personaPrompt].filter(Boolean).join("\n\n");

    let fullPrompt = userMessageContent;
    const currentActiveSpace = spaces.find(s => s.id === activeSpaceId);
    const currentSpaceFilesContent = currentActiveSpace?.files?.map(f => `--- File: ${f.name} ---\n${f.content}\n--- End File ---`).join('\n\n') || '';

    if (activeSpaceId && currentSpaceFilesContent) {
        fullPrompt = `${userMessageContent}\n\n--- Relevant Context from Space "${currentActiveSpace?.name || 'current'}" ---\n${currentSpaceFilesContent}\n--- End of Context ---`;
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
        openErrorDialog(
            lang === 'he' ? "שגיאת API" : "API Error", 
            lang === 'he' ? `אוי לא, התקשורת עם ה-API נכשלה. הסיבה: ${response.error}. אולי לנסות שוב בעוד כמה רגעים?` : `Oh no, communication with the API failed. Reason: ${response.error}. Maybe try again in a few moments?`
        );
        const errorMessage: ChatMessageItem = { role: "assistant", content: `${lang === 'he' ? 'שגיאה: ' : 'Error: '}${response.error}`, timestamp: new Date().toISOString(), isError: true };
        setMessages(prev => [...prev, errorMessage]);
    } else {
        const assistantMessage: ChatMessageItem = { 
            role: "assistant", 
            content: response.message, 
            timestamp: new Date().toISOString(),
            suggestions: [ 
                lang === 'he' ? "ספר לי עוד" : "Tell me more",
                lang === 'he' ? "הסבר את זה אחרת" : "Explain that differently",
                lang === 'he' ? "מה המשמעות של זה?" : "What does this mean?"
            ]
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

  const handleContinuousConversationToggle = () => {
      const newMode = !continuousConversation;
      setContinuousConversation(newMode);
      if (newMode) {
          if (!isListening) {
             clearTranscript();
             startListening();
          }
      } else if (isListening) {
          stopListening();
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
            } else if (file.type === 'application/pdf') {
                fileContent = `Simulated PDF text for ${file.name}: "Title: ${file.name}. This document contains multiple sections. Section 1 discusses [topic A]. Section 2 explores [topic B]. Key data points include [data point 1] and [data point 2]. The document concludes with recommendations regarding [conclusion topic]." (This is simulated text extraction).`;
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'application/msword') {
                fileContent = `Simulated Word document text for ${file.name}: "Document Title: ${file.name}. Abstract: This document provides an overview of [subject]. Introduction: The purpose of this document is to [purpose]. Main Content: Key findings suggest [finding 1] and [finding 2]. Figures and tables might be referenced but are not displayed in this text-only simulation. Conclusion: [summary of conclusion]. (This is simulated text extraction)."`;
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

  const validModels = apiSettings.filter(m => m.isValid);

  const handleInsertPrompt = (promptContent: string) => {
    setInput(prev => prev + promptContent);
    setShowSavedPromptsDialog(false);
  };
  
  const currentPersonaName = personas.find(p => p.id === activePersonaId)?.name || (lang === 'he' ? "ברירת מחדל" : "Default");
  const chatAreaBg = "var(--bg-primary)"; 
  const activeSpaceDetails = spaces.find(s => s.id === activeSpaceId);
  const chatPageHeaderBg = "var(--bg-primary)"; 
  const chatPageHeaderBorder = "var(--border)";
  const chatPageInputAreaBg = "var(--bg-primary)";

  const promptBarPlaceholder = lang === 'he' ? `יש לך שאלה? - ${userProfile?.userName || 'משתמש'}` : `Got a question? - ${userProfile?.userName || 'User'}`;


  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] relative"> 
      {/* Header section inside ChatPage is removed as per new design (controlled by index.tsx) */}
      
      <div className="flex-1 flex flex-col overflow-hidden"> 
            <div 
              aria-live="polite"
              className="flex-1 overflow-y-auto p-3 md:p-4" 
              style={{ backgroundColor: chatAreaBg }}
            >
                {/* Large Welcome Message for Empty Chat */}
                {messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                         <h2 className="gemini-welcome-text">
                            {lang === 'he' ? `שלום, ${userProfile?.userName || 'משתמש'}!` : `Hello, ${userProfile?.userName || 'User'}!`}
                        </h2>
                        {/* Optionally add some prompt starter cards here later if needed */}
                    </div>
                )}

                {messages.map((message, index) =>
                    <ChatMessage
                        key={index}
                        message={message}
                        onSpeak={speak}
                        onSuggestionClick={(suggestionText) => {
                            setInput(suggestionText);
                        }}
                    />
                )}
                 {isLoading && (
                    <div className="flex items-center justify-start mb-4">
                        <MessageCircle className="w-8 h-8 p-1.5 rounded-md self-start flex-shrink-0 bg-[var(--bg-secondary)] text-[var(--text-primary)] me-2" /> {/* Adapted icon style */}
                        <div className="flex items-center space-x-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] p-3 rounded-lg shadow-sm">
                            <Loader2 className="h-4 w-4 animate-spin text-[var(--accent-primary-light)]" />
                            <span className="text-sm">{currentThinkingMessage}</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* New Gemini-like Prompt Bar */}
            <div className={`p-3 border-t border-[var(--border-light)] bg-[var(--bg-primary-light)]`}>
                {attachedFiles.length > 0 && (
                    <div className="mb-1.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
                        {attachedFiles.map(file => <FilePreview key={file.id} file={file} onRemove={() => removeAttachedFile(file.id)} />)}
                    </div>
                )}
                <form 
                    id="chat-form" 
                    onSubmit={handleSubmit} 
                    className="flex items-end gap-2 gemini-prompt-bar"
                >
                    <button type="button" onClick={handleSpeechToText} title={lang === 'he' ? (isListening ? 'הפסק הקלטה' : 'הקלט קול') : (isListening ? 'Stop Listening' : 'Record Voice')} className={`gemini-prompt-bar-icon p-1 rounded-full hover:bg-black/5 ${isListening ? "text-[var(--error)] bg-[var(--error)]/10" : ""}`}>
                        {isListening ? <MicOff /> : <Mic />}
                    </button>
                    
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isListening ? (lang === 'he' ? "מאזין..." : "Listening...") : promptBarPlaceholder}
                        disabled={isLoading}
                        className="gemini-prompt-bar textarea" // Specific class for easier targeting if needed
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    {/* Visual Placeholders for Canvas, Deep Research, File Upload */}
                    <div className="flex items-center gap-1.5">
                        <button type="button" title="Canvas (Visual Placeholder)" className="gemini-prompt-bar-tag">
                            <Palette className="gemini-prompt-bar-icon" /> Canvas
                        </button>
                        <button type="button" title="Deep Research (Visual Placeholder)" className="gemini-prompt-bar-tag">
                            <BrainIcon className="gemini-prompt-bar-icon" /> Deep Research
                        </button>
                         <button type="button" onClick={() => fileInputRef.current?.click()} title={lang === 'he' ? 'צרף קובץ' : 'Attach File'} className="gemini-prompt-bar-icon p-1 rounded-full hover:bg-black/5">
                            <Plus />
                        </button>
                    </div>
                    <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf,.doc,.docx,.txt,.md,text/plain" />
                    
                    <button id="chat-submit-button" type="submit" disabled={isLoading || (!input.trim() && !transcript.trim() && attachedFiles.length === 0)} className="gemini-send-button">
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizontal className="w-5 h-5"/>}
                    </button>
                </form>
            </div>
      </div>
        
      {/* Side info panel (styling might need minor tweaks for new theme) */}
      <div 
        className={`fixed inset-y-0 ${lang === 'he' ? 'left-0 border-r' : 'right-0 border-l'} 
                    w-64 sm:w-72 bg-[var(--bg-secondary)] shadow-xl 
                    transition-transform duration-300 ease-in-out z-30 transform 
                    ${isChatInfoPanelOpen ? 'translate-x-0' : (lang === 'he' ? '-translate-x-full' : 'translate-x-full')}
                    border-[var(--border)] flex flex-col`}
      >
          <div className="flex justify-between items-center p-3 border-b border-[var(--border)]">
              <h3 className="text-md font-medium text-[var(--text-primary)]">{lang === 'he' ? 'מידע שיחה' : 'Conversation Info'}</h3>
              <Button onClick={() => setIsChatInfoPanelOpen(false)} variant="ghost" size="icon" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md p-1.5">
                  <X className="w-4 h-4" />
              </Button>
          </div>
          <div className="p-3 space-y-3 text-sm overflow-y-auto flex-1">
              <Card className="bg-[var(--bg-primary)] border-[var(--border)]">
                  <CardContent className="pt-3 space-y-2.5 text-xs">
                      <div>
                          <Label htmlFor="active-model-display" className="text-[var(--text-secondary)]">{lang === 'he' ? 'מודל פעיל:' : 'Active Model:'}</Label>
                          {currentModelId && apiSettings.find(m => m.id === currentModelId) ?
                              <p id="active-model-display" className="text-[var(--accent)] font-medium">{apiSettings.find(m => m.id === currentModelId)?.name || 'N/A'}</p> :
                              <p id="active-model-display" className="text-[var(--error)]">{lang === 'he' ? 'לא נבחר מודל תקין' : 'No valid model selected'}</p>
                          }
                      </div>
                      <div>
                          <Label htmlFor="active-persona-display" className="text-[var(--text-secondary)]">{lang === 'he' ? 'פרסונה פעילה:' : 'Active Persona:'}</Label>
                          <p id="active-persona-display" className="font-medium text-[var(--text-primary)]">{currentPersonaName}</p>
                      </div>
                      {activeSpaceId && activeSpaceDetails && (
                          <div>
                              <Label htmlFor="active-space-display" className="text-[var(--text-secondary)]">{lang === 'he' ? 'מרחב פעיל:' : 'Active Space:'}</Label>
                              <p id="active-space-display" className="font-medium text-[var(--text-primary)]">{activeSpaceDetails.name}</p>
                              <p className="text-xs text-[var(--text-secondary)]/80">{lang === 'he' ? `(${(activeSpaceDetails.files || []).length} קבצים)` : `(${(activeSpaceDetails.files || []).length} files)`}</p>
                          </div>
                      )}
                      <div className="border-t border-[var(--border)] pt-2.5">
                          <Label htmlFor="chat-cost-display" className="text-[var(--text-secondary)]">{lang === 'he' ? 'עלות שיחה נוכחית:' : 'Current Chat Cost:'}</Label>
                          <p id="chat-cost-display" className="font-medium text-[var(--text-primary)]">${currentConversationCost.toFixed(5)}</p>
                      </div>
                      <div>
                          <Label htmlFor="chat-tokens-display" className="text-[var(--text-secondary)]">{lang === 'he' ? 'טוקנים בשיחה (נכנס/יוצא):' : 'Chat Tokens (In/Out):'}</Label>
                          <p id="chat-tokens-display" className="font-medium text-[var(--text-primary)]">{currentConversationTokens.incoming.toLocaleString()} / {currentConversationTokens.outgoing.toLocaleString()}</p>
                      </div>
                      <div className="pt-2">
                           <Label htmlFor="continuous-conv-toggle" className="text-[var(--text-secondary)] flex items-center cursor-pointer w-full">
                              <Switch id="continuous-conv-toggle" checked={continuousConversation} onCheckedChange={handleContinuousConversationToggle} />
                              <span className="ms-2 text-xs">{lang === 'he' ? 'שיחה רציפה' : 'Continuous Conversation'}</span>
                          </Label>
                      </div>
                  </CardContent>
              </Card>
              
              {userProfile?.systemPrompt && (
                  <Card className="bg-[var(--bg-primary)] border-[var(--border)]">
                      <CardHeader className="p-2.5"><CardTitle className="text-xs font-medium text-[var(--text-secondary)]">{lang === 'he' ? 'הנחיית מערכת (משתמש):' : 'System Prompt (User):'}</CardTitle></CardHeader>
                      <CardContent className="p-2.5 text-xs max-h-24 overflow-y-auto text-[var(--text-primary)]">
                          {userProfile.systemPrompt}
                      </CardContent>
                  </Card>
              )}
              {personas.find(p => p.id === activePersonaId)?.prompt && (
                   <Card className="bg-[var(--bg-primary)] border-[var(--border)]">
                      <CardHeader className="p-2.5"><CardTitle className="text-xs font-medium text-[var(--text-secondary)]">{lang === 'he' ? 'הנחיית מערכת (פרסונה):' : 'System Prompt (Persona):'}</CardTitle></CardHeader>
                      <CardContent className="p-2.5 text-xs max-h-24 overflow-y-auto text-[var(--text-primary)]">
                          {personas.find(p => p.id === activePersonaId)?.prompt}
                      </CardContent>
                  </Card>
              )}
          </div>
      </div>
      {isChatInfoPanelOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden" 
            onClick={() => setIsChatInfoPanelOpen(false)}
        />
      )}

      <Dialog open={showSavedPromptsDialog} onOpenChange={setShowSavedPromptsDialog} size="lg">
        <DialogHeader>
            <DialogTitle>{lang === 'he' ? 'הנחיות שמורות' : 'Saved Prompts'}</DialogTitle>
        </DialogHeader>
        <DialogContent className="p-4 max-h-[60vh] overflow-y-auto">
            {savedPrompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {savedPrompts.map(prompt => (
                        <Card key={prompt.id} className="cursor-pointer hover:border-[var(--accent)] transition-colors bg-[var(--bg-primary)]" onClick={() => handleInsertPrompt(prompt.content)}>
                            <CardHeader className="p-3"><CardTitle className="text-sm">{prompt.title}</CardTitle></CardHeader>
                            <CardContent className="p-3 text-xs text-[var(--text-secondary)] truncate h-10 overflow-hidden">{prompt.content}</CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-center text-[var(--text-secondary)] py-6">{lang === 'he' ? 'אין הנחיות שמורות. ניתן להוסיף בהגדרות.' : 'No saved prompts. Add some in settings.'}</p>
            )}
        </DialogContent>
        <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSavedPromptsDialog(false)}>{lang === 'he' ? 'סגור' : 'Close'}</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
