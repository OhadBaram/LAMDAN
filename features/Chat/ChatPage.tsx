import React, { useState, useEffect, useRef, useCallback } from "react";
import { Paperclip, X, Plus, Sparkles, SendHorizontal, Loader2, Mic, MicOff } from "lucide-react";
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


export function ChatPage() {
  const { lang, apiSettings, recordTokenUsage, speak, continuousConversation, setContinuousConversation, isListening, startListening, stopListening, transcript, setTranscript, clearTranscript, isSidebarOpen, setIsSidebarOpen, openErrorDialog, ChatHistoryStorage, InvokeLLM: InvokeLLMFromContext, theme } = useAppContext(); // Added theme
  const { userProfile, activePersonaId, personas, activeSpaceId, spaces, savedPrompts } = useUserSettings();

  const [currentChatId, setCurrentChatId] = useState(`chat-${Date.now()}`);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ id: string; name: string; type: string; dataUrl: string; content: string }>>([]);
  const [showSavedPromptsDialog, setShowSavedPromptsDialog] = useState(false);

  const [currentModelId, setCurrentModelId] = useState<string | null>(null);
  const [currentConversationCost, setCurrentConversationCost] = useState(0);
  const [currentConversationTokens, setCurrentConversationTokens] = useState({ incoming: 0, outgoing: 0 });

  const activeSpace = spaces.find(s => s.id === activeSpaceId);

    useEffect(() => {
        const loadHistory = async () => {
            const history = await ChatHistoryStorage.get(currentChatId);
            if (history && history.messages) {
                setMessages(history.messages);
                setCurrentConversationCost(history.cost || 0);
                setCurrentConversationTokens(history.tokens || { incoming: 0, outgoing: 0 });
            } else {
                 setMessages([{ role: "assistant", content: lang === 'he' ? "שלום! איך אוכל לעזור?" : "Hello! How can I help?", timestamp: new Date().toISOString() }]);
                 setCurrentConversationCost(0);
                 setCurrentConversationTokens({ incoming: 0, outgoing: 0 });
            }
        };
        loadHistory();
    }, [currentChatId, lang, ChatHistoryStorage]);

    useEffect(() => {
        if (messages.length > 1 || currentConversationCost > 0) {
            ChatHistoryStorage.upsert({ id: currentChatId, messages, cost: currentConversationCost, tokens: currentConversationTokens, lastUpdated: new Date().toISOString() });
        }
    }, [messages, currentConversationCost, currentConversationTokens, currentChatId, ChatHistoryStorage]);


  useEffect(() => {
    const defaultApiModel = apiSettings.find(s => s.isDefault && s.isValid) || apiSettings.find(s => s.isValid) || null;
    if (defaultApiModel) setCurrentModelId(defaultApiModel.id);
    else if (apiSettings.length > 0 && !apiSettings.some(s => s.isValid)) {
      openErrorDialog(lang === 'he' ? "אין מודלים מאומתים" : "No Valid Models", lang === 'he' ? "נראה שאין לך מודלים מאומתים. אנא עבור להגדרות ובדוק את תצורות ה-API שלך." : "It seems you don't have any validated models. Please go to settings and validate your API configurations.");
    }
  }, [apiSettings, lang, openErrorDialog]);

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

    setInput("");
    setAttachedFiles([]);
    clearTranscript();
    setIsLoading(true);

    const activeModelConfig = apiSettings.find(m => m.id === currentModelId);
    if (!activeModelConfig || !activeModelConfig.isValid) {
        openErrorDialog(lang === 'he' ? "שגיאת מודל" : "Model Error", lang === 'he' ? "המודל הנבחר אינו זמין או לא תקין. אנא בחר מודל אחר או בדוק את ההגדרות." : "The selected model is not available or invalid. Please select another model or check settings.");
        setIsLoading(false);
        setMessages(prev => prev.slice(0, -1)); // Remove optimistic user message
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
        openErrorDialog(lang === 'he' ? "שגיאת API" : "API Error", response.error);
        const errorMessage: ChatMessageItem = { role: "assistant", content: `${lang === 'he' ? 'שגיאה: ' : 'Error: '}${response.error}`, timestamp: new Date().toISOString(), isError: true };
        setMessages(prev => [...prev, errorMessage]);
    } else {
        const assistantMessage: ChatMessageItem = { role: "assistant", content: response.message, timestamp: new Date().toISOString() };
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
  },[input, transcript, attachedFiles, isLoading, currentModelId, activePersonaId, activeSpaceId, apiSettings, personas, userProfile, spaces, messages, lang, openErrorDialog, recordTokenUsage, speak, startListening, clearTranscript, continuousConversation, isListening, setInput, setAttachedFiles, setIsLoading, setMessages, setCurrentConversationCost, setCurrentConversationTokens, InvokeLLMFromContext ]);


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
  const chatAreaBg = theme === 'dark' 
    ? (userProfile?.chatBgColor && userProfile.chatBgColor !== '#f3f4f6' && userProfile.chatBgColor !== '#f4f6f8' ? userProfile.chatBgColor : '#1f2937') // Dark slate if default
    : (userProfile?.chatBgColor || '#f4f6f8'); // Light slate if default


  return (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-800`}> {/* ChatPage fills height from main */}
      {/* Top bar for chat controls, above message list */}
      <div className={`px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10`}>
        <div className="flex items-center gap-2">
            <Button onClick={() => { setCurrentChatId(`chat-${Date.now()}`); setMessages([{ role: "assistant", content: lang === 'he' ? "שלום! איך אוכל לעזור?" : "Hello! How can I help?", timestamp: new Date().toISOString() }]); setCurrentConversationCost(0); setCurrentConversationTokens({ incoming: 0, outgoing: 0 }); }} variant="outline" size="sm">
                <Plus className="w-4 h-4 me-2"/> {lang === 'he' ? 'שיחה חדשה' : 'New Chat'}
            </Button>
            {validModels.length > 0 && currentModelId && (
                <div className="flex items-center gap-1">
                    <Label htmlFor="model-select-chat" className="text-xs whitespace-nowrap mb-0 sr-only">{lang === 'he' ? 'מודל:' : 'Model:'}</Label>
                    <Select
                        id="model-select-chat"
                        value={currentModelId}
                        onChange={(e) => setCurrentModelId(e.target.value)}
                        className="text-xs p-1.5 min-w-[150px] rounded-md"
                        disabled={isLoading}
                    >
                        {validModels.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
                    </Select>
                </div>
            )}
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} title={lang === 'he' ? 'הצג/הסתר מידע שיחה' : 'Toggle Conversation Info'} className="rounded-full">
            <Sparkles className="w-5 h-5"/>
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden relative"> {/* Container for messages and sidebar */}
        <div className="flex-1 flex flex-col overflow-hidden"> {/* Main chat area */}
            <div 
              className="flex-1 overflow-y-auto p-4 md:p-6" 
              style={{ backgroundColor: chatAreaBg }}
            >
                {messages.map((message, index) =>
                    <ChatMessage
                        key={index}
                        message={message}
                        onSpeak={speak}
                    />
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 md:p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                {attachedFiles.length > 0 && (
                    <div className="mb-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {attachedFiles.map(file => <FilePreview key={file.id} file={file} onRemove={() => removeAttachedFile(file.id)} />)}
                    </div>
                )}
                <form id="chat-form" onSubmit={handleSubmit} className="flex items-end gap-2">
                    <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} title={lang === 'he' ? 'צרף קובץ' : 'Attach File'} className="rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-700">
                        <Paperclip className="w-5 h-5"/>
                    </Button>
                    <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf,.doc,.docx,.txt,.md,text/plain" />

                    <Button type="button" variant="ghost" size="icon" onClick={() => setShowSavedPromptsDialog(true)} title={lang === 'he' ? 'הנחיות שמורות' : 'Saved Prompts'} className="rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-700">
                        <Sparkles className="w-5 h-5"/>
                    </Button>

                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isListening ? (lang === 'he' ? "מאזין..." : "Listening...") : (lang === 'he' ? "הקלד שאלה או השתמש במיקרופון..." : "Type a question or use the microphone...")}
                        disabled={isLoading}
                        className="flex-1 min-h-[44px] max-h-[150px] resize-none rounded-xl px-4 py-2.5"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={handleSpeechToText} title={lang === 'he' ? (isListening ? 'הפסק הקלטה' : 'הקלט קול') : (isListening ? 'Stop Listening' : 'Record Voice')} className={`rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-700 ${isListening ? "text-red-500 bg-red-100 dark:bg-red-900/50" : ""}`}>
                        {isListening ? <MicOff className="w-5 h-5"/> : <Mic className="w-5 h-5"/>}
                    </Button>
                    <Button id="chat-submit-button" type="submit" disabled={isLoading || (!input.trim() && !transcript.trim() && attachedFiles.length === 0)} size="icon" className="p-2.5 rounded-xl">
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizontal className="w-5 h-5"/>}
                    </Button>
                </form>
            </div>
        </div>
        
        {/* Chat Info Sidebar */}
        <aside className={`absolute top-0 ${lang === 'he' ? 'left-0 border-r' : 'right-0 border-l'} bottom-0 w-72 bg-slate-50 dark:bg-slate-800 shadow-xl transition-transform duration-300 ease-in-out p-4 overflow-y-auto z-20 transform ${isSidebarOpen ? 'translate-x-0' : (lang === 'he' ? '-translate-x-full' : 'translate-x-full')} border-slate-200 dark:border-slate-700`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{lang === 'he' ? 'מידע שיחה' : 'Conversation Info'}</h3>
                <Button onClick={() => setIsSidebarOpen(false)} variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full">
                    <X className="w-5 h-5" />
                </Button>
            </div>
            <div className="space-y-4 text-sm">
                <Card className="bg-white dark:bg-slate-700/50">
                    <CardContent className="pt-4 space-y-3">
                        <div>
                            <Label htmlFor="active-model-display" className="text-slate-600 dark:text-slate-300">{lang === 'he' ? 'מודל פעיל:' : 'Active Model:'}</Label>
                            {currentModelId && apiSettings.find(m => m.id === currentModelId) ?
                                <p id="active-model-display" className="text-indigo-600 dark:text-indigo-400 font-medium">{apiSettings.find(m => m.id === currentModelId)?.name || 'N/A'}</p> :
                                <p id="active-model-display" className="text-red-500">{lang === 'he' ? 'לא נבחר מודל תקין' : 'No valid model selected'}</p>
                            }
                        </div>
                        <div>
                            <Label htmlFor="active-persona-display" className="text-slate-600 dark:text-slate-300">{lang === 'he' ? 'פרסונה פעילה:' : 'Active Persona:'}</Label>
                            <p id="active-persona-display" className="font-medium text-slate-700 dark:text-slate-200">{currentPersonaName}</p>
                        </div>
                        {activeSpaceId && activeSpace && (
                            <div>
                                <Label htmlFor="active-space-display" className="text-slate-600 dark:text-slate-300">{lang === 'he' ? 'מרחב פעיל:' : 'Active Space:'}</Label>
                                <p id="active-space-display" className="font-medium text-slate-700 dark:text-slate-200">{activeSpace.name}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">{lang === 'he' ? `(${(activeSpace.files || []).length} קבצים)` : `(${(activeSpace.files || []).length} files)`}</p>
                            </div>
                        )}
                        <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
                            <Label htmlFor="chat-cost-display" className="text-slate-600 dark:text-slate-300">{lang === 'he' ? 'עלות שיחה נוכחית:' : 'Current Chat Cost:'}</Label>
                            <p id="chat-cost-display" className="font-medium text-slate-700 dark:text-slate-200">${currentConversationCost.toFixed(5)}</p>
                        </div>
                        <div>
                            <Label htmlFor="chat-tokens-display" className="text-slate-600 dark:text-slate-300">{lang === 'he' ? 'טוקנים בשיחה (נכנס/יוצא):' : 'Chat Tokens (In/Out):'}</Label>
                            <p id="chat-tokens-display" className="font-medium text-slate-700 dark:text-slate-200">{currentConversationTokens.incoming.toLocaleString()} / {currentConversationTokens.outgoing.toLocaleString()}</p>
                        </div>
                        <div className="pt-2">
                             <Label htmlFor="continuous-conv-toggle" className="text-slate-600 dark:text-slate-300 flex items-center cursor-pointer w-full">
                                <Switch id="continuous-conv-toggle" checked={continuousConversation} onCheckedChange={handleContinuousConversationToggle} />
                                <span className="ms-2">{lang === 'he' ? 'שיחה רציפה' : 'Continuous Conversation'}</span>
                            </Label>
                        </div>
                    </CardContent>
                </Card>
                
                {userProfile?.systemPrompt && (
                    <Card className="bg-white dark:bg-slate-700/50">
                        <CardHeader className="p-3"><CardTitle className="text-sm font-medium">{lang === 'he' ? 'הנחיית מערכת (משתמש):' : 'System Prompt (User):'}</CardTitle></CardHeader>
                        <CardContent className="p-3 text-xs max-h-28 overflow-y-auto text-slate-600 dark:text-slate-300">
                            {userProfile.systemPrompt}
                        </CardContent>
                    </Card>
                )}
                {personas.find(p => p.id === activePersonaId)?.prompt && (
                     <Card className="bg-white dark:bg-slate-700/50">
                        <CardHeader className="p-3"><CardTitle className="text-sm font-medium">{lang === 'he' ? 'הנחיית מערכת (פרסונה):' : 'System Prompt (Persona):'}</CardTitle></CardHeader>
                        <CardContent className="p-3 text-xs max-h-28 overflow-y-auto text-slate-600 dark:text-slate-300">
                            {personas.find(p => p.id === activePersonaId)?.prompt}
                        </CardContent>
                    </Card>
                )}
            </div>
        </aside>
      </div>

      <Dialog open={showSavedPromptsDialog} onOpenChange={setShowSavedPromptsDialog} size="lg">
        <DialogHeader>
            <DialogTitle>{lang === 'he' ? 'הנחיות שמורות' : 'Saved Prompts'}</DialogTitle>
        </DialogHeader>
        <DialogContent className="p-6 max-h-[60vh] overflow-y-auto">
            {savedPrompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedPrompts.map(prompt => (
                        <Card key={prompt.id} className="cursor-pointer hover:shadow-lg transition-shadow bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleInsertPrompt(prompt.content)}>
                            <CardHeader><CardTitle className="text-md">{prompt.title}</CardTitle></CardHeader>
                            <CardContent className="text-sm text-slate-600 dark:text-slate-300 truncate h-12 overflow-hidden">{prompt.content}</CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-center text-slate-500 dark:text-slate-400">{lang === 'he' ? 'אין הנחיות שמורות. ניתן להוסיף בהגדרות.' : 'No saved prompts. Add some in settings.'}</p>
            )}
        </DialogContent>
        <DialogFooter>
            <Button variant="outline" onClick={() => setShowSavedPromptsDialog(false)}>{lang === 'he' ? 'סגור' : 'Close'}</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}