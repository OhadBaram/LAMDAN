
import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit3, Trash2, Database, SendHorizontal, Loader2, BookOpen, FileText as FileTextIcon, AlertTriangle, X } from "lucide-react";
import { useAppContext, ChatMessageItem } from '../../contexts/AppContext';
import { useUserSettings, KnowledgeBase, KnowledgeBaseSource } from '../../contexts/UserSettingsContext';

import { Button as UiButton } from '../../components/ui/Button'; // Aliased import
import { Input as UiInput } from '../../components/ui/Input'; // Aliased import for Input
import { Textarea } from '../../components/ui/Textarea';
import { Label } from '../../components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '../../components/ui/Dialog';
import { Select } from '../../components/ui/Select';
import { ChatMessage } from '../Chat/ChatMessage'; 
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent as AlertDialogContentComponent, AlertDialogDescription, AlertDialogFooter as AlertDialogFooterComponent, AlertDialogHeader as AlertDialogHeaderComponent, AlertDialogTitle as AlertDialogTitleComponent } from "../../components/ui/AlertDialog";


export function KnowledgeBasePage() {
    const { lang, apiSettings, recordTokenUsage, speak, openErrorDialog, InvokeLLM, theme } = useAppContext();
    const {
        knowledgeBases,
        loadKnowledgeBases,
        addKnowledgeBase,
        updateKnowledgeBase,
        deleteKnowledgeBase,
        activeKnowledgeBaseId,
        setActiveKnowledgeBaseId,
        addSourceToKnowledgeBase,
        removeSourceFromKnowledgeBase,
        updateSourceInKnowledgeBase, 
        userProfile,
        markFeatureVisited
    } = useUserSettings();

    const [showManageKbDialog, setShowManageKbDialog] = useState(false);
    const [editingKb, setEditingKb] = useState<Partial<KnowledgeBase> | null>(null);
    const [showAddSourceDialog, setShowAddSourceDialog] = useState(false);
    const [editingSource, setEditingSource] = useState<Partial<KnowledgeBaseSource> | null>(null);
    
    const [query, setQuery] = useState("");
    const [isLoadingQuery, setIsLoadingQuery] = useState(false);
    const [queryMessages, setQueryMessages] = useState<ChatMessageItem[]>([]);
    const queryMessagesEndRef = useRef<HTMLDivElement>(null);

    const [showDeleteKbConfirm, setShowDeleteKbConfirm] = useState(false);
    const [kbToDelete, setKbToDelete] = useState<KnowledgeBase | null>(null);
    const [showDeleteSourceConfirm, setShowDeleteSourceConfirm] = useState(false);
    const [sourceToDelete, setSourceToDelete] = useState<KnowledgeBaseSource | null>(null);
    const [kbIdForSourceDeletion, setKbIdForSourceDeletion] = useState<string | null>(null);


    useEffect(() => {
        loadKnowledgeBases();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        queryMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [queryMessages]);
    
    useEffect(() => {
        setQueryMessages([]); // Reset query messages when active KB changes
        const currentKb = knowledgeBases.find(kb => kb.id === activeKnowledgeBaseId);
        if (showManageKbDialog && editingKb && currentKb && editingKb.id === currentKb.id) {
            setEditingKb(currentKb); // Refresh editingKb if dialog is open and active KB changed source list
        }
    }, [activeKnowledgeBaseId, knowledgeBases]); // Removed showManageKbDialog, editingKb from deps to avoid loops


    const handleCreateNewKb = () => {
        setEditingKb({ name: '', description: '' });
        setShowManageKbDialog(true);
    };

    const handleManageSelectedKb = () => {
        const currentKb = knowledgeBases.find(kb => kb.id === activeKnowledgeBaseId);
        if (currentKb) {
            setEditingKb(currentKb);
            setShowManageKbDialog(true);
        } else {
            openErrorDialog(lang === 'he' ? 'שגיאה' : 'Error', lang === 'he' ? 'אה, נראה שצריך לבחור מאגר ידע קודם.' : 'Ah, it seems you need to select a knowledge base first.');
        }
    };

    const handleSaveKb = async () => {
        if (!editingKb || !editingKb.name?.trim()) {
            openErrorDialog(lang === 'he' ? 'שם חסר' : 'Name Missing', lang === 'he' ? 'כל מאגר ידע צריך שם, בבקשה.' : 'Every knowledge base needs a name, please.');
            return;
        }
        if (editingKb.id) {
            await updateKnowledgeBase(editingKb.id, { name: editingKb.name, description: editingKb.description });
        } else {
            const newKb = await addKnowledgeBase({ name: editingKb.name, description: editingKb.description });
            setActiveKnowledgeBaseId(newKb.id);
        }
        setShowManageKbDialog(false);
        setEditingKb(null);
    };
    
    const confirmDeleteKb = (kb: KnowledgeBase) => {
        setKbToDelete(kb);
        setShowDeleteKbConfirm(true);
    };

    const executeDeleteKb = async () => {
        if (kbToDelete) {
            await deleteKnowledgeBase(kbToDelete.id);
            setKbToDelete(null);
            setShowDeleteKbConfirm(false);
             if (activeKnowledgeBaseId === kbToDelete.id) { // This condition was fine
                setActiveKnowledgeBaseId(knowledgeBases.length > 0 ? knowledgeBases[0].id : null);
            }
        }
    };

    const handleAddNewSource = (currentManagingKbId: string) => {
        setEditingSource({ title: '', content: '', type: 'text' });
        setKbIdForSourceDeletion(currentManagingKbId); // Store context for saving
        setShowAddSourceDialog(true);
    };

    const handleEditSource = (source: KnowledgeBaseSource, currentManagingKbId: string) => {
        setEditingSource(source);
        setKbIdForSourceDeletion(currentManagingKbId); // Store context for saving
        setShowAddSourceDialog(true);
    };

    const handleSaveSource = async () => {
        if (!editingSource || !editingSource.title?.trim() || !editingSource.content?.trim() || !kbIdForSourceDeletion) {
            openErrorDialog(lang === 'he' ? 'פרטים חסרים' : 'Missing Details', lang === 'he' ? 'כותרת ותוכן המקור הם חובה.' : 'Source title and content are required.');
            return;
        }
        const sourceDataToSave: Omit<KnowledgeBaseSource, 'id' | 'createdAt'> = {
            title: editingSource.title,
            content: editingSource.content,
            type: 'text'
        };

        let updatedKbResult: KnowledgeBase | null = null;
        if (editingSource.id) { // Editing existing source
            updatedKbResult = await updateSourceInKnowledgeBase(kbIdForSourceDeletion, editingSource.id, sourceDataToSave);
        } else { // Adding new source
            updatedKbResult = await addSourceToKnowledgeBase(kbIdForSourceDeletion, sourceDataToSave);
        }

        if (updatedKbResult) {
            setEditingKb(updatedKbResult); // Update the KB being managed in the dialog
        }
        setShowAddSourceDialog(false);
        setEditingSource(null);
        setKbIdForSourceDeletion(null);
    };
    
    const confirmDeleteSource = (source: KnowledgeBaseSource, managingKbId: string) => {
        setSourceToDelete(source);
        setKbIdForSourceDeletion(managingKbId);
        setShowDeleteSourceConfirm(true);
    };

    const executeDeleteSource = async () => {
        if (sourceToDelete && kbIdForSourceDeletion) {
            const updatedKbResult = await removeSourceFromKnowledgeBase(kbIdForSourceDeletion, sourceToDelete.id);
            if (updatedKbResult) {
                setEditingKb(updatedKbResult); // Update the KB being managed in the dialog
            }
            setSourceToDelete(null);
            setShowDeleteSourceConfirm(false);
            setKbIdForSourceDeletion(null);
        }
    };

    const handleQuerySubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const submissionQuery = query.trim();
        if (!submissionQuery || isLoadingQuery || !activeKnowledgeBaseId) return;

        const currentKb = knowledgeBases.find(kb => kb.id === activeKnowledgeBaseId);
        if (!currentKb || !currentKb.sources || currentKb.sources.length === 0) {
            openErrorDialog(lang === 'he' ? 'מאגר ריק' : 'Empty Knowledge Base', lang === 'he' ? 'מאגר הידע הנבחר ריק או שאין בו מקורות. הוסף מקורות כדי לשאול שאלות.' : 'The selected knowledge base is empty or has no sources. Add sources to ask questions.');
            return;
        }
        
        const userMessage: ChatMessageItem = { role: "user", content: submissionQuery, timestamp: new Date().toISOString() };
        setQueryMessages(prev => [...prev, userMessage]);
        setQuery("");
        setIsLoadingQuery(true);

        const activeModelConfig = apiSettings.find(m => m.isDefault && m.isValid) || apiSettings.find(m => m.isValid);
        if (!activeModelConfig) {
            openErrorDialog(lang === 'he' ? 'מודל לא זמין' : 'Model Not Available', lang === 'he' ? 'לא נמצא מודל API תקין. בדוק את ההגדרות.' : 'No valid API model found. Check settings.');
            setIsLoadingQuery(false);
            setQueryMessages(prev => [...prev, {role: "assistant", content: "Error: No valid API model.", timestamp: new Date().toISOString(), isError: true}]);
            return;
        }

        const contextString = currentKb.sources.map(s => `Source: ${s.title}\nContent:\n${s.content}\n---`).join("\n\n");
        const systemPrompt = `You are an AI assistant. Answer the user's question based *only* on the following provided context. If the answer is not found in the context, state that you cannot answer based on the provided information. Do not use any external knowledge. Context:\n\n${contextString}`;

        const response = await InvokeLLM({
            modelConfig: activeModelConfig,
            prompt: submissionQuery,
            systemPrompt: systemPrompt,
            conversationHistory: queryMessages.slice(-5) 
        });

        setIsLoadingQuery(false);
        if (response.error) {
            openErrorDialog(lang === 'he' ? 'שגיאת API' : 'API Error', response.error);
            setQueryMessages(prev => [...prev, { role: "assistant", content: `Error: ${response.error}`, timestamp: new Date().toISOString(), isError: true }]);
        } else {
            setQueryMessages(prev => [...prev, { role: "assistant", content: response.message, timestamp: new Date().toISOString() }]);
            recordTokenUsage(response.provider, response.modelId, response.usage.incomingTokens, response.usage.outgoingTokens, response.cost);
        }
    };
    
    const currentKbDetails = activeKnowledgeBaseId ? knowledgeBases.find(kb => kb.id === activeKnowledgeBaseId) : null;
    const chatAreaBg = "var(--bg-primary)";


    return (
        <div className="flex flex-col md:flex-row h-full gap-4">
            {/* Sidebar for KB list and selection */}
            <div className="w-full md:w-1/3 lg:w-1/4 p-1 md:border-e border-[var(--border)] md:overflow-y-auto">
                <Card className="shadow-none border-0 md:border md:shadow-sm">
                    <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3">
                        <CardTitle className="text-base">{lang === 'he' ? 'מאגרי ידע' : 'Knowledge Bases'}</CardTitle>
                        <UiButton onClick={handleCreateNewKb} size="sm" variant="default"><Plus className="w-3.5 h-3.5 me-1"/>{lang === 'he' ? 'חדש' : 'New'}</UiButton>
                    </CardHeader>
                    <CardContent className="p-3">
                        {knowledgeBases.length > 0 ? (
                            <ul className="space-y-1.5">
                                {knowledgeBases.map(kb => (
                                    <li key={kb.id}>
                                        <UiButton
                                            variant={activeKnowledgeBaseId === kb.id ? 'default' : 'outline'}
                                            className="w-full justify-start text-left text-sm h-auto py-2 px-2.5"
                                            onClick={() => setActiveKnowledgeBaseId(kb.id)}
                                        >
                                            <Database className="w-3.5 h-3.5 me-2 flex-shrink-0"/>
                                            <div className="flex-1 min-w-0">
                                                <span className="block truncate font-medium">{kb.name}</span>
                                                <span className={`block truncate text-xs ${activeKnowledgeBaseId === kb.id ? 'text-[var(--text-primary-light)]/80' : 'text-[var(--text-secondary)]'}`}>
                                                    {(kb.sources || []).length} {lang === 'he' ? 'מקורות' : 'sources'}
                                                </span>
                                            </div>
                                        </UiButton>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-sm text-[var(--text-secondary)] py-4">{lang === 'he' ? 'אין מאגרי ידע. צור אחד כדי להתחיל.' : 'No knowledge bases. Create one to get started.'}</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Main content area for sources or query */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {currentKbDetails ? (
                     // If KB is selected, show its details or query interface
                    <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary)]">
                        <div className="p-3 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-primary)] sticky top-0 z-10">
                            <h2 className="text-lg font-medium text-[var(--text-primary)] truncate">{currentKbDetails.name}</h2>
                            <UiButton onClick={handleManageSelectedKb} variant="outline" size="sm">
                                <Edit3 className="w-3.5 h-3.5 me-1"/>{lang === 'he' ? 'נהל מאגר' : 'Manage KB'}
                            </UiButton>
                        </div>

                        {queryMessages.length > 0 || isLoadingQuery || !activeKnowledgeBaseId || currentKbDetails.sources.length === 0 ? (
                             // Query Interface
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="flex-1 overflow-y-auto p-3 md:p-4" style={{ backgroundColor: chatAreaBg }} aria-live="polite">
                                    {currentKbDetails.sources.length === 0 && !isLoadingQuery && (
                                        <Card className="my-4 text-center bg-yellow-500/10 border-yellow-500/30">
                                            <CardContent className="p-4">
                                                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500"/>
                                                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                                    {lang === 'he' ? 'מאגר הידע הזה ריק.' : 'This knowledge base is empty.'}
                                                </p>
                                                <p className="text-xs text-yellow-500 dark:text-yellow-300">
                                                    {lang === 'he' ? 'הוסף מקורות מידע דרך כפתור "נהל מאגר" כדי להתחיל לשאול שאלות.' : 'Add sources via the "Manage KB" button to start asking questions.'}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}
                                    {queryMessages.map((msg, idx) => (
                                        <ChatMessage key={idx} message={msg} onSpeak={speak} />
                                    ))}
                                    {isLoadingQuery && (
                                        <div className="flex items-center justify-start mb-4">
                                            <Database className="w-8 h-8 p-1.5 rounded-md self-start flex-shrink-0 bg-[var(--accent)]/20 text-[var(--accent)] me-2" />
                                            <div className="flex items-center space-x-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] p-3 rounded-lg shadow-sm">
                                                <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
                                                <span className="text-sm">{lang === 'he' ? 'מאחזר מידע מהמאגר...' : 'Querying knowledge base...'}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={queryMessagesEndRef} />
                                </div>
                                <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-primary)]">
                                    <form onSubmit={handleQuerySubmit} className="flex items-center gap-2">
                                        <UiInput
                                            type="text"
                                            value={query}
                                            onChange={e => setQuery(e.target.value)}
                                            placeholder={lang === 'he' ? `שאל על "${currentKbDetails.name}"...` : `Ask about "${currentKbDetails.name}"...`}
                                            className="flex-1 text-base"
                                            disabled={isLoadingQuery || currentKbDetails.sources.length === 0}
                                        />
                                        <UiButton type="submit" disabled={isLoadingQuery || !query.trim() || currentKbDetails.sources.length === 0} size="icon" className="p-2.5 bg-[var(--accent)] text-[var(--text-primary-light)]">
                                            {isLoadingQuery ? <Loader2 className="w-4 h-4 animate-spin"/> : <SendHorizontal className="w-4 h-4"/>}
                                        </UiButton>
                                    </form>
                                </div>
                            </div>
                        ) : (
                             // Source List / "Add Source" prompt
                            <div className="p-4 text-center">
                                <BookOpen className="w-12 h-12 mx-auto mb-3 text-[var(--text-secondary)]"/>
                                <h3 className="text-lg font-medium text-[var(--text-primary)]">{lang === 'he' ? 'מאגר מוכן לשאילתות' : 'KB Ready for Queries'}</h3>
                                <p className="text-sm text-[var(--text-secondary)] mb-3">
                                    {lang === 'he' ? `מאגר זה מכיל ${currentKbDetails.sources.length} מקורות. אתה יכול להתחיל לשאול שאלות או לנהל את המקורות.` : `This KB has ${currentKbDetails.sources.length} sources. You can start querying or manage sources.`}
                                </p>
                                <UiButton onClick={() => setQueryMessages([{ role: 'assistant', content: lang === 'he' ? `שלום! איך אוכל לעזור לך עם המידע מתוך '${currentKbDetails.name}'?` : `Hello! How can I help you with information from '${currentKbDetails.name}'?`, timestamp: new Date().toISOString() }])}>
                                    {lang === 'he' ? 'התחל לשאול' : 'Start Querying'}
                                </UiButton>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[var(--bg-primary)]">
                        <Database className="w-16 h-16 text-[var(--text-secondary)] mb-4"/>
                        <h2 className="text-xl font-medium text-[var(--text-primary)]">{lang === 'he' ? 'בחר או צור מאגר ידע' : 'Select or Create a Knowledge Base'}</h2>
                        <p className="text-[var(--text-secondary)] mt-1">{lang === 'he' ? 'השתמש בסרגל הצד כדי לבחור מאגר קיים או ליצור אחד חדש כדי להתחיל.' : 'Use the sidebar to select an existing knowledge base or create a new one to get started.'}</p>
                    </div>
                )}
            </div>

            {/* Manage KB Dialog */}
            <Dialog open={showManageKbDialog} onOpenChange={setShowManageKbDialog} size="lg">
                <DialogHeader>
                    <DialogTitle>{editingKb?.id ? (lang === 'he' ? 'נהל מאגר ידע' : 'Manage Knowledge Base') : (lang === 'he' ? 'צור מאגר ידע חדש' : 'Create New Knowledge Base')}</DialogTitle>
                </DialogHeader>
                <DialogContent className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
                    <div>
                        <Label htmlFor="kbName">{lang === 'he' ? 'שם מאגר הידע' : 'Knowledge Base Name'}</Label>
                        <UiInput id="kbName" value={editingKb?.name || ''} onChange={e => setEditingKb(k => ({...k, name: e.target.value}))} />
                    </div>
                    <div>
                        <Label htmlFor="kbDescription">{lang === 'he' ? 'תיאור (אופציונלי)' : 'Description (Optional)'}</Label>
                        <Textarea id="kbDescription" value={editingKb?.description || ''} onChange={e => setEditingKb(k => ({...k, description: e.target.value}))} rows={2}/>
                    </div>
                    {editingKb?.id && (
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <h4 className="font-medium text-[var(--text-primary)]">{lang === 'he' ? 'מקורות מידע' : 'Sources'}</h4>
                                <UiButton size="sm" variant="outline" onClick={() => handleAddNewSource(editingKb.id!)}><Plus className="w-3.5 h-3.5 me-1"/>{lang === 'he' ? 'הוסף מקור' : 'Add Source'}</UiButton>
                            </div>
                            {(editingKb.sources || []).length > 0 ? (
                                <ul className="space-y-1.5 border border-[var(--border)] rounded-md p-2 bg-[var(--bg-primary)] max-h-60 overflow-y-auto">
                                    {(editingKb.sources || []).map(source => (
                                        <li key={source.id} className="p-2 border border-[var(--border)] rounded-md flex justify-between items-center bg-[var(--bg-secondary)]">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-[var(--text-primary)] truncate" title={source.title}>{source.title}</p>
                                                <p className="text-xs text-[var(--text-secondary)] truncate" title={source.content}>{source.content}</p>
                                            </div>
                                            <div className="space-x-1 ms-2 flex-shrink-0">
                                                <UiButton size="icon" variant="ghost" onClick={() => handleEditSource(source, editingKb!.id!)} className="p-1"><Edit3 className="w-3.5 h-3.5"/></UiButton>
                                                <UiButton size="icon" variant="ghost" onClick={() => confirmDeleteSource(source, editingKb!.id!)} className="p-1 text-[var(--error)] hover:bg-[var(--error)]/10"><Trash2 className="w-3.5 h-3.5"/></UiButton>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-center text-[var(--text-secondary)] py-3">{lang === 'he' ? 'אין מקורות במאגר זה.' : 'No sources in this KB.'}</p>
                            )}
                        </div>
                    )}
                </DialogContent>
                <DialogFooter>
                    {editingKb?.id && <UiButton variant="destructive" className="me-auto" onClick={() => confirmDeleteKb(editingKb as KnowledgeBase)}>{lang === 'he' ? 'מחק מאגר' : 'Delete KB'}</UiButton>}
                    <UiButton variant="ghost" onClick={() => {setShowManageKbDialog(false); setEditingKb(null);}}>{lang === 'he' ? 'ביטול' : 'Cancel'}</UiButton>
                    <UiButton onClick={handleSaveKb} variant="default">{lang === 'he' ? 'שמור' : 'Save'}</UiButton>
                </DialogFooter>
            </Dialog>

            {/* Add/Edit Source Dialog */}
            <Dialog open={showAddSourceDialog} onOpenChange={setShowAddSourceDialog}>
                <DialogHeader>
                    <DialogTitle>{editingSource?.id ? (lang === 'he' ? 'ערוך מקור' : 'Edit Source') : (lang === 'he' ? 'הוסף מקור חדש' : 'Add New Source')}</DialogTitle>
                </DialogHeader>
                <DialogContent className="p-4 space-y-3">
                    <div>
                        <Label htmlFor="sourceTitle">{lang === 'he' ? 'כותרת המקור' : 'Source Title'}</Label>
                        <UiInput id="sourceTitle" value={editingSource?.title || ''} onChange={e => setEditingSource(s => ({...s, title: e.target.value}))} />
                    </div>
                    <div>
                        <Label htmlFor="sourceContent">{lang === 'he' ? 'תוכן המקור (טקסט בלבד)' : 'Source Content (Text only)'}</Label>
                        <Textarea id="sourceContent" value={editingSource?.content || ''} onChange={e => setEditingSource(s => ({...s, content: e.target.value}))} rows={8}/>
                    </div>
                </DialogContent>
                <DialogFooter>
                    <UiButton variant="ghost" onClick={() => {setShowAddSourceDialog(false); setEditingSource(null); setKbIdForSourceDeletion(null);}}>{lang === 'he' ? 'ביטול' : 'Cancel'}</UiButton>
                    <UiButton onClick={handleSaveSource} variant="default">{lang === 'he' ? 'שמור מקור' : 'Save Source'}</UiButton>
                </DialogFooter>
            </Dialog>

             {/* Confirm Delete KB Dialog */}
            <AlertDialog open={showDeleteKbConfirm} onOpenChange={setShowDeleteKbConfirm}>
                <AlertDialogContentComponent>
                    <AlertDialogHeaderComponent><AlertDialogTitleComponent>{lang === 'he' ? 'אישור מחיקת מאגר ידע' : 'Confirm Knowledge Base Deletion'}</AlertDialogTitleComponent></AlertDialogHeaderComponent>
                    <AlertDialogDescription>
                        {lang === 'he' ? `האם אתה בטוח שברצונך למחוק את מאגר הידע "${kbToDelete?.name}"? פעולה זו תמחק גם את כל מקורות המידע המשויכים אליו ולא ניתן לשחזרה.` : `Are you sure you want to delete the knowledge base "${kbToDelete?.name}"? This will also delete all associated sources and cannot be undone.`}
                    </AlertDialogDescription>
                    <AlertDialogFooterComponent>
                        <AlertDialogCancel onClick={() => setShowDeleteKbConfirm(false)}>{lang === 'he' ? 'ביטול' : 'Cancel'}</AlertDialogCancel>
                        <AlertDialogAction onClick={executeDeleteKb}>{lang === 'he' ? 'מחק מאגר' : 'Delete KB'}</AlertDialogAction>
                    </AlertDialogFooterComponent>
                </AlertDialogContentComponent>
            </AlertDialog>

            {/* Confirm Delete Source Dialog */}
             <AlertDialog open={showDeleteSourceConfirm} onOpenChange={setShowDeleteSourceConfirm}>
                <AlertDialogContentComponent>
                    <AlertDialogHeaderComponent><AlertDialogTitleComponent>{lang === 'he' ? 'אישור מחיקת מקור' : 'Confirm Source Deletion'}</AlertDialogTitleComponent></AlertDialogHeaderComponent>
                    <AlertDialogDescription>
                        {lang === 'he' ? `האם אתה בטוח שברצונך למחוק את המקור "${sourceToDelete?.title}"? לא ניתן לשחזר פעולה זו.` : `Are you sure you want to delete the source "${sourceToDelete?.title}"? This action cannot be undone.`}
                    </AlertDialogDescription>
                    <AlertDialogFooterComponent>
                        <AlertDialogCancel onClick={() => {setShowDeleteSourceConfirm(false); setSourceToDelete(null); setKbIdForSourceDeletion(null);}}>{lang === 'he' ? 'ביטול' : 'Cancel'}</AlertDialogCancel>
                        <AlertDialogAction onClick={executeDeleteSource}>{lang === 'he' ? 'מחק מקור' : 'Delete Source'}</AlertDialogAction>
                    </AlertDialogFooterComponent>
                </AlertDialogContentComponent>
            </AlertDialog>

        </div>
    );
}

// Ensure the component is exported if not already
// export { KnowledgeBasePage };
