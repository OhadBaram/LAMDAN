
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
  const { lang, apiSettings, recordTokenUsage, speak, continuousConversation, setContinuousConversation, isListening, startListening, stopListening, transcript, setTranscript, clearTranscript, isSidebarOpen, setIsSidebarOpen, openErrorDialog, ChatHistoryStorage, InvokeLLM: InvokeLLMFromContext } = useAppContext();
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
  // const spaceFilesContent = activeSpace?.files?.map(f => `--- File: ${f.name} ---\n${f.content}\n--- End File ---`).join('\n\n') || ''; // Not directly used here, but in handleSubmit

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
    
    const response = await InvokeLLMFromContext({ // Use InvokeLLM from context
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

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className={`fixed inset-y-0 ${lang === 'he' ? 'right-0' : 'left-0'} transform ${isSidebarOpen ? 'translate-x-0' : (lang === 'he' ? 'translate-x-full' : '-translate-x-full')} transition-transform duration-300 ease-in-out bg-white dark:bg-gray-800 shadow-lg w-72 p-4 z-30 flex flex-col h-full mt-16 pb-16`}>
         <Button onClick={() => setIsSidebarOpen(false)} variant="ghost" size="icon" className={`absolute top-2 ${lang === 'he' ? 'left-2' : 'right-2'} text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200`}>
            <X className="w-6 h-6" />
        </Button>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{lang === 'he' ? 'מידע שיחה' : 'Conversation Info'}</h3>

        <div className="space-y-3 text-sm mb-auto overflow-y-auto">
            <div>
                <Label htmlFor="active-model-display" className="text-gray-600 dark:text-gray-300">{lang === 'he' ? 'מודל פעיל:' : 'Active Model:'}</Label>
                {currentModelId && apiSettings.find(m => m.id === currentModelId) ?
                    <p id="active-model-display" className="text-indigo-600 dark:text-indigo-400 font-medium">{apiSettings.find(m => m.id === currentModelId)?.name || 'N/A'}</p> :
                    <p id="active-model-display" className="text-red-500">{lang === 'he' ? 'לא נבחר מודל תקין' : 'No valid model selected'}</p>
                }
            </div>
             <div>
                <Label htmlFor="active-persona-display" className="text-gray-600 dark:text-gray-300">{lang === 'he' ? 'פרסונה פעילה:' : 'Active Persona:'}</Label>
                <p id="active-persona-display" className="font-medium">{currentPersonaName}</p>
            </div>
             {activeSpaceId && activeSpace && (
                <div>
                    <Label htmlFor="active-space-display" className="text-gray-600 dark:text-gray-300">{lang === 'he' ? 'מרחב פעיל:' : 'Active Space:'}</Label>
                    <p id="active-space-display" className="font-medium">{activeSpace.name}</p>
                    <p className="text-xs text-gray-400">{lang === 'he' ? `(${(activeSpace.files || []).length} קבצים)` : `(${(activeSpace.files || []).length} files)`}</p>
                </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <Label htmlFor="chat-cost-display" className="text-gray-600 dark:text-gray-300">{lang === 'he' ? 'עלות שיחה נוכחית:' : 'Current Chat Cost:'}</Label>
                <p id="chat-cost-display" className="font-medium">${currentConversationCost.toFixed(5)}</p>
            </div>
            <div>
                <Label htmlFor="chat-tokens-display" className="text-gray-600 dark:text-gray-300">{lang === 'he' ? 'טוקנים בשיחה (נכנס/יוצא):' : 'Chat Tokens (In/Out):'}</Label>
                <p id="chat-tokens-display" className="font-medium">{currentConversationTokens.incoming.toLocaleString()} / {currentConversationTokens.outgoing.toLocaleString()}</p>
            </div>
            <div className="pt-3">
                <Label htmlFor="continuous-conv-toggle" className="text-gray-600 dark:text-gray-300 flex items-center cursor-pointer">
                    <Switch id="continuous-conv-toggle" checked={continuousConversation} onCheckedChange={handleContinuousConversationToggle} />
                    <span className="ms-2">{lang === 'he' ? 'שיחה רציפה' : 'Continuous Conversation'}</span>
                </Label>
            </div>
            {userProfile?.systemPrompt && (
                <Card className="mt-4 bg-gray-50 dark:bg-gray-700/50">
                    <CardHeader className="p-2"><CardTitle className="text-sm">{lang === 'he' ? 'הנחיית מערכת (משתמש):' : 'System Prompt (User):'}</CardTitle></CardHeader>
                    <CardContent className="p-2 text-xs max-h-24 overflow-y-auto">
                        {userProfile.systemPrompt}
                    </CardContent>
                </Card>
            )}
            {personas.find(p => p.id === activePersonaId)?.prompt && (
                 <Card className="mt-2 bg-gray-50 dark:bg-gray-700/50">
                    <CardHeader className="p-2"><CardTitle className="text-sm">{lang === 'he' ? 'הנחיית מערכת (פרסונה):' : 'System Prompt (Persona):'}</CardTitle></CardHeader>
                    <CardContent className="p-2 text-xs max-h-24 overflow-y-auto">
                        {personas.find(p => p.id === activePersonaId)?.prompt}
                    </CardContent>
                </Card>
            )}
        </div>
         <Button onClick={() => { setCurrentChatId(`chat-${Date.now()}`); setMessages([{ role: "assistant", content: lang === 'he' ? "שלום! איך אוכל לעזור?" : "Hello! How can I help?", timestamp: new Date().toISOString() }]); setCurrentConversationCost(0); setCurrentConversationTokens({ incoming: 0, outgoing: 0 }); }} variant="outline" className="w-full mt-4">
            <Plus className="w-4 h-4 me-2"/> {lang === 'he' ? 'שיחה חדשה' : 'New Chat'}
        </Button>
      </div>

      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen && lang === 'he' ? 'mr-72' : ''} ${isSidebarOpen && lang !== 'he' ? 'ml-72' : ''}`}>
        <div className="flex-1 overflow-y-auto p-4 md:p-6" style={{ backgroundColor: userProfile?.chatBgColor || '#f3f4f6' }}>
            {messages.map((message, index) =>
                <ChatMessage
                    key={index}
                    message={message}
                    onSpeak={speak}
                />
            )}
            <div ref={messagesEndRef} />
        </div>

        <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            {attachedFiles.length > 0 && (
                <div className="mb-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {attachedFiles.map(file => <FilePreview key={file.id} file={file} onRemove={() => removeAttachedFile(file.id)} />)}
                </div>
            )}
            <form id="chat-form" onSubmit={handleSubmit} className="flex items-end gap-2">
                <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} title={lang === 'he' ? 'צרף קובץ' : 'Attach File'}>
                    <Paperclip className="w-5 h-5"/>
                </Button>
                <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf,.doc,.docx,.txt,.md,text/plain" />

                <Button type="button" variant="ghost" size="icon" onClick={() => setShowSavedPromptsDialog(true)} title={lang === 'he' ? 'הנחיות שמורות' : 'Saved Prompts'}>
                    <Sparkles className="w-5 h-5"/>
                </Button>

                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isListening ? (lang === 'he' ? "מאזין..." : "Listening...") : (lang === 'he' ? "הקלד שאלה או השתמש במיקרופון..." : "Type a question or use the microphone...")}
                    disabled={isLoading}
                    className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                    rows={1}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                />
                <Button type="button" variant="ghost" size="icon" onClick={handleSpeechToText} title={lang === 'he' ? (isListening ? 'הפסק הקלטה' : 'הקלט קול') : (isListening ? 'Stop Listening' : 'Record Voice')} className={isListening ? "text-red-500" : ""}>
                    {isListening ? <MicOff className="w-5 h-5"/> : <Mic className="w-5 h-5"/>}
                </Button>
                <Button id="chat-submit-button" type="submit" disabled={isLoading || (!input.trim() && !transcript.trim() && attachedFiles.length === 0)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-lg">
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizontal className="w-5 h-5"/>}
                </Button>
            </form>
            <div className="flex items-center justify-start gap-4 mt-2">
                {validModels.length > 0 && currentModelId && (
                    <div className="flex items-center gap-1">
                        <Label htmlFor="model-select-chat" className="text-xs whitespace-nowrap mb-0">{lang === 'he' ? 'מודל:' : 'Model:'}</Label>
                        <Select
                            id="model-select-chat"
                            value={currentModelId}
                            onChange={(e) => setCurrentModelId(e.target.value)}
                            className="text-xs p-1 min-w-[150px]"
                            disabled={isLoading}
                        >
                            {validModels.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
                        </Select>
                    </div>
                )}
                 {validModels.length === 0 && (
                     <p className="text-xs text-red-500">{lang === 'he' ? 'אין מודלים תקינים. אנא בדוק הגדרות API.' : 'No valid models. Check API settings.'}</p>
                 )}
            </div>
        </div>
      </div>

      <Dialog open={showSavedPromptsDialog} onOpenChange={setShowSavedPromptsDialog} size="lg">
        <DialogHeader>
            <DialogTitle>{lang === 'he' ? 'הנחיות שמורות' : 'Saved Prompts'}</DialogTitle>
        </DialogHeader>
        <DialogContent className="p-6 max-h-[60vh] overflow-y-auto">
            {savedPrompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedPrompts.map(prompt => (
                        <Card key={prompt.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleInsertPrompt(prompt.content)}>
                            <CardHeader><CardTitle className="text-md">{prompt.title}</CardTitle></CardHeader>
                            <CardContent className="text-sm text-gray-600 dark:text-gray-300 truncate h-12 overflow-hidden">{prompt.content}</CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">{lang === 'he' ? 'אין הנחיות שמורות. ניתן להוסיף בהגדרות.' : 'No saved prompts. Add some in settings.'}</p>
            )}
        </DialogContent>
        <DialogFooter>
            <Button variant="outline" onClick={() => setShowSavedPromptsDialog(false)}>{lang === 'he' ? 'סגור' : 'Close'}</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
