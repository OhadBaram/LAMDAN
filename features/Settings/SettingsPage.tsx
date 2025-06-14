
import React, { useState, useEffect, useRef } from "react";
import { User as UserIcon, Palette, Server, Users, TrendingUp, Plus, Edit3, Trash2, GripVertical, Star, Calendar, ChevronLeft, ChevronRight, DollarSign, ChevronDown, ChevronUp, CheckCircle, XCircle, Loader2, Check, Play, ExternalLink, Cpu, TrendingDown } from "lucide-react";
import { format, endOfMonth, eachDayOfInterval, getDay, addMonths, isSameMonth } from "date-fns";
import startOfMonth from 'date-fns/startOfMonth';
import subMonths from 'date-fns/subMonths';
import parseISO from 'date-fns/parseISO';
import { he } from 'date-fns/locale/he'; 
import { enUS } from 'date-fns/locale/en-US'; 

import { useAppContext, ApiSetting, KNOWN_MODELS_PRICING, PROVIDER_INFO } from '../../contexts/AppContext';
import { useUserSettings, initialAppCustomizationData, SavedPrompt, Persona, AppCustomization, CostManagement } from '../../contexts/UserSettingsContext';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Label } from '../../components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../../components/ui/Dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '../../components/ui/AlertDialog';
import { Select } from '../../components/ui/Select';
import { Switch } from '../../components/ui/Switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../../components/ui/Table';


interface SettingsLayoutProps {
    children: (props: { activeSettingsTab: string }) => React.ReactNode;
}

function SettingsLayout(props: SettingsLayoutProps) {
    const { children } = props;
    const { lang } = useAppContext();
    const [activeTab, setActiveTab] = useState("profile");

    const tabsConfig = [
        { id: "profile", label: lang === 'he' ? 'פרופיל והנחיות' : 'Profile & Prompts', icon: UserIcon },
        { id: "appearance", label: lang === 'he' ? 'מראה וקול' : 'Appearance & Voice', icon: Palette },
        { id: "api", label: lang === 'he' ? 'API וספקים' : 'API & Providers', icon: Server },
        { id: "personas", label: lang === 'he' ? 'פרסונות' : 'Personas', icon: Users },
        { id: "usage", label: lang === 'he' ? 'שימוש ועלויות' : 'Usage & Costs', icon: TrendingUp },
    ];

    return (
        <div className="container mx-auto max-w-7xl py-6 md:py-8 px-2 sm:px-4 lg:px-6"> 
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 md:mb-8 text-slate-900 dark:text-slate-100">{lang === 'he' ? 'הגדרות' : 'Settings'}</h1>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6 md:gap-8">
                {/* Responsive TabsList: Horizontal scroll on mobile, vertical on desktop */}
                <TabsList 
                    className={`flex flex-row overflow-x-auto pb-2 md:pb-0 md:flex-col md:overflow-x-visible 
                                md:border-b-0 md:space-y-1 w-full md:w-1/4 lg:w-1/5 
                                ${lang === 'he' ? 'md:border-l md:pl-0 md:pr-4 lg:pr-6' : 'md:border-r md:pr-0 md:pl-4 lg:pl-6'} 
                                border-slate-200 dark:border-slate-700 md:sticky md:top-20 md:max-h-[calc(100vh-10rem)] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent`}
                >
                    {tabsConfig.map(tab => (
                        <TabsTrigger 
                            key={tab.id} 
                            value={tab.id} 
                            className={`flex-shrink-0 md:w-full justify-start text-left md:mb-1 px-3 py-2.5 rounded-lg text-sm md:text-base
                                        ${activeTab === tab.id 
                                            ? 'bg-indigo-100 dark:bg-indigo-700/40 text-indigo-700 dark:text-indigo-200 font-semibold' 
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'
                                        }`}
                        >
                            <tab.icon className="w-4 h-4 md:w-5 md:h-5 me-2 md:me-3 flex-shrink-0"/>{tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <div className="flex-1 min-w-0"> {/* Ensure content area can shrink on flex layouts */}
                    {tabsConfig.map(tab => (
                        <TabsContent key={tab.id} value={tab.id} className="h-full"> 
                            {children({ activeSettingsTab: tab.id })}
                        </TabsContent>
                    ))}
                </div>
            </Tabs>
        </div>
    );
}

function ProfileSettings() {
    const { lang } = useAppContext();
    const { userProfile, setUserProfile } = useUserSettings();

    const [name, setName] = useState(userProfile?.userName ?? '');
    const [image, setImage] = useState(userProfile?.userImage ?? ''); // Can be null if no image
    const [systemPrompt, setSystemPrompt] = useState(userProfile?.systemPrompt ?? '');
    const [botName, setBotName] = useState(userProfile?.botName ?? 'LUMINA');
    const [botImage, setBotImage] = useState(userProfile?.botImage ?? ''); // Can be null

    useEffect(() => {
        setName(userProfile?.userName ?? '');
        setImage(userProfile?.userImage ?? '');
        setSystemPrompt(userProfile?.systemPrompt ?? '');
        setBotName(userProfile?.botName ?? 'LUMINA');
        setBotImage(userProfile?.botImage ?? '');
    }, [userProfile]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, setImageCallback: React.Dispatch<React.SetStateAction<string>>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImageCallback(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        setUserProfile({ 
            ...(userProfile || initialAppCustomizationData), 
            userName: name, 
            userImage: image || null, // Ensure null if empty string
            systemPrompt: systemPrompt, 
            botName: botName, 
            botImage: botImage || null // Ensure null if empty string
        });
    };

    return (
         <Card>
            <CardHeader><CardTitle>{lang === 'he' ? 'פרופיל משתמש והנחיית מערכת' : 'User Profile & System Prompt'}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        <Label htmlFor="userName">{lang === 'he' ? 'שם משתמש' : 'User Name'}</Label>
                        <Input id="userName" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="userImage">{lang === 'he' ? 'תמונת פרופיל (משתמש)' : 'User Profile Image'}</Label>
                        <Input id="userImage" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setImage)} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                        {image && <img src={image} alt="User Preview" className="w-20 h-20 rounded-full mt-2 object-cover"/>}
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        <Label htmlFor="botName">{lang === 'he' ? 'שם הבוט' : 'Bot Name'}</Label>
                        <Input id="botName" value={botName} onChange={(e) => setBotName(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="botImage">{lang === 'he' ? 'תמונת פרופיל (בוט)' : 'Bot Profile Image'}</Label>
                        <Input id="botImage" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setBotImage)} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                        {botImage && <img src={botImage} alt="Bot Preview" className="w-20 h-20 rounded-full mt-2 object-cover"/>}
                    </div>
                </div>
                <div>
                    <Label htmlFor="systemPrompt">{lang === 'he' ? 'הנחיית מערכת גלובלית' : 'Global System Prompt'}</Label>
                    <Textarea id="systemPrompt" value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={4} placeholder={lang === 'he' ? 'הכנס הנחיה שתצורף לכל שיחה...' : 'Enter a prompt that will be prepended to all conversations...'}/>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave}>{lang === 'he' ? 'שמור שינויים' : 'Save Changes'}</Button>
            </CardFooter>
        </Card>
    );
}

function SavedPromptsSettings() {
    const { lang } = useAppContext();
    const { savedPrompts, addSavedPrompt, updateSavedPrompt, deleteSavedPrompt, reorderSavedPrompts } = useUserSettings();
    const [editingPrompt, setEditingPrompt] = useState<Partial<SavedPrompt> | null>(null);
    const [showPromptDialog, setShowPromptDialog] = useState(false);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleAddNewPrompt = () => {
        setEditingPrompt({ title: '', content: '' }); 
        setShowPromptDialog(true);
    };
    const handleEditPrompt = (prompt: SavedPrompt) => {
        setEditingPrompt(prompt); // prompt object already has non-null title/content
        setShowPromptDialog(true);
    };
    const handleSavePrompt = async () => {
        if (!editingPrompt || !editingPrompt.title?.trim() || !editingPrompt.content?.trim()) return;
        if (editingPrompt.id) {
            await updateSavedPrompt(editingPrompt.id, editingPrompt);
        } else {
            await addSavedPrompt(editingPrompt as Omit<SavedPrompt, 'id' | 'order'>);
        }
        setShowPromptDialog(false);
        setEditingPrompt(null);
    };
    const handleDeletePrompt = async (promptId: string) => {
        if (window.confirm(lang === 'he' ? 'האם למחוק הנחיה זו?' : 'Delete this prompt?')) {
            await deleteSavedPrompt(promptId);
        }
    };

    const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) return;
        let _prompts = [...savedPrompts];
        const draggedItemContent = _prompts.splice(dragItem.current, 1)[0];
        _prompts.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        reorderSavedPrompts(_prompts);
    };

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <CardTitle>{lang === 'he' ? 'ניהול הנחיות שמורות' : 'Manage Saved Prompts'}</CardTitle>
                <Button onClick={handleAddNewPrompt} size="sm"><Plus className="w-4 h-4 me-2"/>{lang === 'he' ? 'הוסף הנחיה' : 'Add Prompt'}</Button>
            </CardHeader>
            <CardContent>
                {savedPrompts.length > 0 ? (
                    <ul className="space-y-3">
                        {savedPrompts.map((prompt, index) => (
                            <li
                                key={prompt.id}
                                draggable
                                onDragStart={() => dragItem.current = index}
                                onDragEnter={() => dragOverItem.current = index}
                                onDragEnd={handleDragSort}
                                onDragOver={(e) => e.preventDefault()}
                                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between group cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow bg-slate-50 dark:bg-slate-700/30"
                            >
                                <div className="flex items-center flex-1 min-w-0">
                                    <GripVertical className="w-5 h-5 text-slate-400 dark:text-slate-500 me-3 invisible group-hover:visible flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{prompt.title}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{prompt.content}</p>
                                    </div>
                                </div>
                                <div className="space-x-2 flex-shrink-0 ms-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEditPrompt(prompt)}><Edit3 className="w-3 h-3 me-1"/>{lang === 'he' ? 'ערוך' : 'Edit'}</Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDeletePrompt(prompt.id)}><Trash2 className="w-3 h-3 me-1"/>{lang === 'he' ? 'מחק' : 'Delete'}</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">{lang === 'he' ? 'אין הנחיות שמורות.' : 'No saved prompts yet.'}</p>
                )}
            </CardContent>

            <Dialog open={showPromptDialog} onOpenChange={setShowPromptDialog} size="md">
                <DialogHeader>
                    <DialogTitle>{editingPrompt?.id ? (lang === 'he' ? 'ערוך הנחיה' : 'Edit Prompt') : (lang === 'he' ? 'הוסף הנחיה חדשה' : 'Add New Prompt')}</DialogTitle>
                </DialogHeader>
                <DialogContent className="p-6 space-y-4">
                    <div>
                        <Label htmlFor="promptTitle">{lang === 'he' ? 'כותרת' : 'Title'}</Label>
                        <Input id="promptTitle" value={editingPrompt?.title ?? ''} onChange={(e) => setEditingPrompt(p => ({...(p || { title: '', content: ''}), title: e.target.value}))} />
                    </div>
                    <div>
                        <Label htmlFor="promptContent">{lang === 'he' ? 'תוכן ההנחיה' : 'Prompt Content'}</Label>
                        <Textarea id="promptContent" value={editingPrompt?.content ?? ''} onChange={(e) => setEditingPrompt(p => ({...(p || { title: '', content: ''}), content: e.target.value}))} rows={5}/>
                    </div>
                </DialogContent>
                <DialogFooter>
                    <Button variant="outline" onClick={() => {setShowPromptDialog(false); setEditingPrompt(null);}}>{lang === 'he' ? 'ביטול' : 'Cancel'}</Button>
                    <Button onClick={handleSavePrompt}>{lang === 'he' ? 'שמור' : 'Save'}</Button>
                </DialogFooter>
            </Dialog>
        </Card>
    );
}

function AppearanceSettings() {
    const { lang, theme, toggleTheme, activeVoice, setActiveVoice, availableVoices, speak, openErrorDialog, loadVoices } = useAppContext();
    const { userProfile, setUserProfile } = useUserSettings();
    
    const [customization, setCustomizationState] = useState<AppCustomization>(() => {
        const profile = userProfile || initialAppCustomizationData;
        return {
            headerBgColor: profile.headerBgColor || initialAppCustomizationData.headerBgColor || '#2c3e50',
            headerTitleColor: profile.headerTitleColor || initialAppCustomizationData.headerTitleColor || '#ecf0f1',
            chatBgColor: profile.chatBgColor || initialAppCustomizationData.chatBgColor || '#f4f6f8',
            chatFontColor: profile.chatFontColor || initialAppCustomizationData.chatFontColor || '#34495e',
            chatFontSize: profile.chatFontSize || initialAppCustomizationData.chatFontSize || 14,
            botVoiceURI: profile.botVoiceURI || null,
            userName: profile.userName || initialAppCustomizationData.userName || '',
            userImage: profile.userImage || null,
            botName: profile.botName || initialAppCustomizationData.botName || '',
            botImage: profile.botImage || null,
            systemPrompt: profile.systemPrompt || initialAppCustomizationData.systemPrompt || '',
        };
    });

    useEffect(() => {
        const profile = userProfile || initialAppCustomizationData;
        setCustomizationState(prev => ({
            ...prev,
            headerBgColor: profile.headerBgColor || initialAppCustomizationData.headerBgColor || '#2c3e50',
            headerTitleColor: profile.headerTitleColor || initialAppCustomizationData.headerTitleColor || '#ecf0f1',
            chatBgColor: profile.chatBgColor || initialAppCustomizationData.chatBgColor || '#f4f6f8',
            chatFontColor: profile.chatFontColor || initialAppCustomizationData.chatFontColor || '#34495e',
            chatFontSize: profile.chatFontSize || initialAppCustomizationData.chatFontSize || 14,
            botVoiceURI: (activeVoice && !profile.botVoiceURI) ? activeVoice.voiceURI : (profile.botVoiceURI ?? null),
            userName: profile.userName ?? initialAppCustomizationData.userName ?? '',
            userImage: profile.userImage ?? null,
            botName: profile.botName ?? initialAppCustomizationData.botName ?? '',
            botImage: profile.botImage ?? null,
            systemPrompt: profile.systemPrompt ?? initialAppCustomizationData.systemPrompt ?? '',
        }));
    }, [userProfile, activeVoice]);


    const handleCustomizationChange = (field: keyof AppCustomization, value: any) => {
        setCustomizationState(prev => ({...prev, [field]: value}));
    };

    const handleSaveAppearance = () => {
        setUserProfile(customization);
    };

    const handleResetAppearance = async () => {
        const resetData = {
            ...initialAppCustomizationData,
            botVoiceURI: null 
        };
        setCustomizationState(resetData);
        await setUserProfile(resetData); 
        loadVoices(); 
    };

    const handlePlaySampleVoice = () => {
         const voiceToPlay = availableVoices.find(v => v.voiceURI === customization.botVoiceURI && v.lang.startsWith(lang)) ||
                            availableVoices.find(v => v.lang.startsWith(lang));

        if (voiceToPlay) {
            const utterance = new SpeechSynthesisUtterance(lang === 'he' ? 'זוהי דוגמת קול בעברית.' : 'This is a sample voice in English.');
            utterance.voice = voiceToPlay;
            utterance.lang = lang;
            utterance.onerror = (event) => {
                console.error("Sample speech error:", event.error);
                openErrorDialog(lang === 'he' ? "שגיאת דיבור" : "Speech Error", lang === 'he' ? "לא ניתן להשמיע דוגמת קול." : "Could not play voice sample.");
            };
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);

        } else {
             openErrorDialog(
                lang === 'he' ? "אין קול זמין" : "No Voice Available",
                lang === 'he' ? `לא נבחר קול או שאין קול זמין לשפה ${lang}. אנא בדוק את הגדרות הקול שלך.` : `No voice selected or available for ${lang}. Please check your voice settings.`
            );
        }
    };

    const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const voiceURI = e.target.value;
        const selected = availableVoices.find(v => v.voiceURI === voiceURI);
        if (selected) {
            setActiveVoice(selected); 
            setCustomizationState(prev => ({...prev, botVoiceURI: voiceURI }));
        } else {
            setActiveVoice(null);
            setCustomizationState(prev => ({...prev, botVoiceURI: null }));
        }
    };

    const currentLangVoices = availableVoices.filter(v => v.lang.startsWith(lang));

    return (
        <Card>
            <CardHeader><CardTitle>{lang === 'he' ? 'התאמה אישית של מראה וקול' : 'Appearance & Voice Customization'}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                 <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                    <Label htmlFor="theme-switch" className="mb-0">{lang === 'he' ? 'ערכת נושא כהה' : 'Dark Theme'}</Label>
                    <Switch id="theme-switch" checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="headerBgColor">{lang === 'he' ? 'צבע רקע כותרת' : 'Header Background Color'}</Label>
                        <Input id="headerBgColor" type="color" value={customization.headerBgColor ?? '#2c3e50'} onChange={(e) => handleCustomizationChange('headerBgColor', e.target.value)} className="h-10"/>
                    </div>
                    <div>
                        <Label htmlFor="headerTitleColor">{lang === 'he' ? 'צבע טקסט כותרת' : 'Header Title Color'}</Label>
                        <Input id="headerTitleColor" type="color" value={customization.headerTitleColor ?? '#ecf0f1'} onChange={(e) => handleCustomizationChange('headerTitleColor', e.target.value)} className="h-10"/>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="chatBgColor">{lang === 'he' ? 'צבע רקע צ\'אט' : 'Chat Background Color'}</Label>
                        <Input id="chatBgColor" type="color" value={customization.chatBgColor ?? '#f4f6f8'} onChange={(e) => handleCustomizationChange('chatBgColor', e.target.value)} className="h-10"/>
                    </div>
                    <div>
                        <Label htmlFor="chatFontColor">{lang === 'he' ? 'צבע גופן צ\'אט (תשובות בוט)' : 'Chat Font Color (Bot Replies)'}</Label>
                        <Input id="chatFontColor" type="color" value={customization.chatFontColor ?? '#34495e'} onChange={(e) => handleCustomizationChange('chatFontColor', e.target.value)} className="h-10"/>
                    </div>
                </div>
                <div>
                    <Label htmlFor="chatFontSize">{lang === 'he' ? 'גודל גופן צ\'אט (פיקסלים)' : 'Chat Font Size (pixels)'}</Label>
                    <Input id="chatFontSize" type="number" min={10} max={24} value={customization.chatFontSize ?? 14} onChange={(e) => handleCustomizationChange('chatFontSize', parseInt(e.target.value))} />
                </div>
                <div>
                    <Label htmlFor="botVoice">{lang === 'he' ? 'קול הבוט' : 'Bot Voice'}</Label>
                    <div className="flex items-center gap-2">
                        <Select
                            id="botVoice"
                            value={customization.botVoiceURI ?? ''} 
                            onChange={handleVoiceChange}
                            disabled={currentLangVoices.length === 0}
                            className="flex-grow"
                        >
                            <option value="">{lang === 'he' ? (currentLangVoices.length === 0 ? 'אין קולות זמינים' : 'בחר קול...') : (currentLangVoices.length === 0 ? 'No voices available' : 'Select voice...')}</option>
                            {currentLangVoices.map(voice => (
                                <option key={voice.voiceURI} value={voice.voiceURI}>
                                    {voice.name} ({voice.lang})
                                </option>
                            ))}
                        </Select>
                        <Button onClick={handlePlaySampleVoice} variant="outline" size="sm" disabled={!customization.botVoiceURI || currentLangVoices.length === 0}>
                            <Play className="w-4 h-4 me-1" /> {lang === 'he' ? 'השמע דוגמה' : 'Play Sample'}
                        </Button>
                    </div>
                    {currentLangVoices.length === 0 && (
                        <p className="text-xs text-red-500 mt-1">
                            {lang === 'he' ? `לא נמצאו קולות מותקנים עבור ${lang === 'he' ? 'עברית' : 'אנגלית'} במערכת שלך.` : `No installed voices found for ${lang === 'he' ? 'Hebrew' : 'English'} on your system.`}
                        </p>
                    )}
                </div>
                 <Button onClick={handleResetAppearance} variant="outline" className="w-full md:w-auto">
                    {lang === 'he' ? 'אפס הגדרות מראה וקול' : 'Reset Appearance & Voice Settings'}
                </Button>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSaveAppearance}>{lang === 'he' ? 'שמור שינויים' : 'Save Changes'}</Button>
            </CardFooter>
        </Card>
    );
}

function ApiSettingsSection() {
    const { lang, apiSettings, loadApiSettings, openErrorDialog, ApiSettingsStorage, validateApiKey } = useAppContext();
    const [showAddModelDialog, setShowAddModelDialog] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editingModel, setEditingModel] = useState<Partial<ApiSetting> | null>(null);
    const [deleteModelId, setDeleteModelId] = useState<string | null>(null);
    const [savingModel, setSavingModel] = useState(false);
    const [validatingModelId, setValidatingModelId] = useState<string | null>(null);

    const getInitialEditingModel = (): Partial<ApiSetting> => ({
        name: '',
        provider: 'openai',
        modelId: PROVIDER_INFO.openai.defaultModel,
        apiKey: '',
        apiUrl: '',
        costs: KNOWN_MODELS_PRICING[PROVIDER_INFO.openai.defaultModel] || { input: 0, output: 0 },
        isFreeTier: KNOWN_MODELS_PRICING[PROVIDER_INFO.openai.defaultModel]?.isFreeTier ?? false, // Ensure boolean
        modelSystemPrompt: '',
        isDefault: false, // Ensure boolean
        isValid: false, // Ensure boolean
    });


    const handleAddNewModel = () => {
        setEditingModel(getInitialEditingModel());
        setShowAddModelDialog(true);
    };

    const handleEditModel = (model: ApiSetting) => {
        setEditingModel({
            ...getInitialEditingModel(), 
            ...model, 
            name: model.name ?? '',
            apiKey: model.provider === 'google' ? '' : (model.apiKey ?? ''), // Clear API key for Google if editing
            apiUrl: model.apiUrl ?? '',
            modelSystemPrompt: model.modelSystemPrompt ?? '',
            isFreeTier: model.isFreeTier ?? false,
            isDefault: model.isDefault ?? false,
            isValid: model.isValid ?? false,
            costs: model.costs || {input:0, output:0} // Ensure costs is not undefined
        });
        setShowAddModelDialog(true);
    };

    const handleDeleteConfirm = (modelId: string) => {
        setDeleteModelId(modelId);
        setShowDeleteConfirm(true);
    };

    const handleDeleteModel = async () => {
        if (deleteModelId) {
            await ApiSettingsStorage.delete(deleteModelId);
            await loadApiSettings();
        }
        setShowDeleteConfirm(false);
        setDeleteModelId(null);
    };

    const handleSaveModel = async () => {
        if (!editingModel || !editingModel.name?.trim() || !editingModel.provider?.trim() || !editingModel.modelId?.trim() || 
            (editingModel.provider !== 'google' && !(editingModel.apiKey||'').trim()) 
        ) {
             openErrorDialog(lang === 'he' ? 'שדות חסרים' : 'Missing Fields', lang === 'he' ? 'אנא מלא את כל שדות החובה (שם, ספק, מזהה מודל, ומפתח API אם נדרש).' : 'Please fill all required fields (Name, Provider, Model ID, and API Key if required).');
            return;
        }
        setSavingModel(true);
        const modelToSave: ApiSetting = {
            id: editingModel.id || `api-${Date.now()}`,
            name: editingModel.name,
            provider: editingModel.provider,
            modelId: editingModel.modelId.trim(),
            apiKey: editingModel.provider === 'google' ? '' : (editingModel.apiKey || ''), // API key is not stored for Google
            apiUrl: editingModel.apiUrl?.trim() || undefined,
            costs: editingModel.costs || KNOWN_MODELS_PRICING[editingModel.modelId.trim()] || { input: 0, output: 0 },
            isFreeTier: editingModel.isFreeTier || false,
            modelSystemPrompt: editingModel.modelSystemPrompt || '',
            isDefault: editingModel.isDefault || false,
            isValid: editingModel.isValid || false, // Validation will update this
            lastValidated: editingModel.lastValidated
        };

        await ApiSettingsStorage.upsert(modelToSave);
        await loadApiSettings();
        setShowAddModelDialog(false);
        setEditingModel(null);
        setSavingModel(false);
    };

    const handleSetDefault = async (modelIdToSet: string) => {
        const updates = apiSettings.map(m =>
            ApiSettingsStorage.upsert({ ...m, isDefault: m.id === modelIdToSet })
        );
        await Promise.all(updates);
        await loadApiSettings();
    };

    const handleValidateModel = async (modelToValidate: ApiSetting) => {
        setValidatingModelId(modelToValidate.id);
        // For Google, apiKey in modelToValidate will be empty, validateApiKey relies on process.env.API_KEY
        const result = await validateApiKey(modelToValidate);
        let updatedModel = { ...modelToValidate, isValid: result.isValid, lastValidated: new Date().toISOString() };
        if(result.error) {
            openErrorDialog(lang === 'he' ? 'שגיאת ולידציה' : 'Validation Error', `${lang === 'he' ? 'הבדיקה נכשלה: ' : 'Validation failed: '}${result.error}`);
        } else {
             openErrorDialog(lang === 'he' ? 'ולידציה הצליחה' : 'Validation Successful', lang === 'he' ? 'המודל תקין ומוכן לשימוש.' : 'Model is valid and ready to use.');
        }
        await ApiSettingsStorage.upsert(updatedModel);
        await loadApiSettings();
        setValidatingModelId(null);
    };

    const CollapsibleCostsEditor = ({ costs, onChange, modelId, provider }: { costs?: {input?:number, output?:number}, onChange: (newCosts: {input?:number, output?:number}) => void, modelId?: string, provider?:string }) => {
        const [isOpen, setIsOpen] = useState(false);
        const knownPricing = modelId ? KNOWN_MODELS_PRICING[modelId] : null;

        const handleCostChange = (type: 'input' | 'output', value: string) => {
            const numValue = parseFloat(value);
            onChange({ ...(costs || {input:0, output:0}), [type]: isNaN(numValue) ? undefined : numValue });
        };

        const isGoogleTiered = provider === 'google' && modelId && modelId.includes('gemini-1.5-pro');

        return (
            <div className="mt-2 text-sm">
                <Button variant="ghost" onClick={() => setIsOpen(!isOpen)} className="text-xs px-2 py-1.5 mb-1 w-full justify-start text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md">
                    {isOpen ? <ChevronUp className="w-3 h-3 me-1"/> : <ChevronDown className="w-3 h-3 me-1"/>}
                    {lang === 'he' ? 'ערוך עלויות (למיליון טוקנים)' : 'Edit Costs (per 1M tokens)'}
                    {knownPricing && <span className="ms-1 text-slate-400 dark:text-slate-500 text-xs">({lang === 'he' ? 'מוכר:' : 'Known:'} I:{knownPricing.input.toFixed(2)} O:{knownPricing.output.toFixed(2)})</span>}
                </Button>
                {isOpen && (
                    <div className="p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 space-y-2">
                        {isGoogleTiered && <p className="text-xs text-yellow-600 dark:text-yellow-400">{lang === 'he' ? 'לתמחור מדורג של Gemini 1.5 Pro, עיין בתיעוד הרשמי והזן את המחיר הרלוונטי ביותר עבורך או השאר ריק לשימוש בתמחור ברירת מחדל.' : 'For Gemini 1.5 Pro tiered pricing, consult official docs and enter the most relevant rate, or leave blank for default.'}</p>}
                        <div>
                            <Label htmlFor="inputCost" className="text-xs">{lang === 'he' ? 'עלות קלט (Input)' : 'Input Cost'}</Label>
                            <Input id="inputCost" type="number" step="0.01" value={costs?.input ?? ''} onChange={e => handleCostChange('input', e.target.value)} placeholder={knownPricing?.input?.toFixed(2) || "e.g., 0.50"} className="text-xs p-1.5 h-auto" />
                        </div>
                        <div>
                            <Label htmlFor="outputCost" className="text-xs">{lang === 'he' ? 'עלות פלט (Output)' : 'Output Cost'}</Label>
                            <Input id="outputCost" type="number" step="0.01" value={costs?.output ?? ''} onChange={e => handleCostChange('output', e.target.value)} placeholder={knownPricing?.output?.toFixed(2) || "e.g., 1.50"} className="text-xs p-1.5 h-auto"/>
                        </div>
                    </div>
                )}
            </div>
        );
    };


    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <CardTitle>{lang === 'he' ? 'ניהול מודלי API' : 'API Model Management'}</CardTitle>
                <Button onClick={handleAddNewModel} size="sm"><Plus className="w-4 h-4 me-2"/>{lang === 'he' ? 'הוסף מודל חדש' : 'Add New Model'}</Button>
            </CardHeader>
            <CardContent>
                {apiSettings.length > 0 ? (
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>{lang === 'he' ? 'שם' : 'Name'}</TableHead>
                            <TableHead>{lang === 'he' ? 'ספק' : 'Provider'}</TableHead>
                            <TableHead>{lang === 'he' ? 'מזהה מודל' : 'Model ID'}</TableHead>
                            <TableHead>{lang === 'he' ? 'סטטוס' : 'Status'}</TableHead>
                            <TableHead>{lang === 'he' ? 'עלויות (I/O)' : 'Costs (I/O)'}</TableHead>
                            <TableHead className="text-right">{lang === 'he' ? 'פעולות' : 'Actions'}</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {apiSettings.map(model => (
                                <TableRow key={model.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                        {model.name}
                                        {model.isDefault && <span title={lang === 'he' ? 'ברירת מחדל' : 'Default'}><Star className="w-4 h-4 text-yellow-400" /></span>}
                                        {model.isFreeTier && <span title={lang === 'he' ? 'שכבה חינמית זמינה' : 'Free tier available'}><Cpu className="w-4 h-4 text-green-500" /></span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>{PROVIDER_INFO[model.provider]?.name || model.provider}</TableCell>
                                    <TableCell className="font-mono text-xs">{model.modelId}</TableCell>
                                    <TableCell>
                                        {model.isValid ?
                                            <span className="flex items-center text-green-600 dark:text-green-400"><CheckCircle className="w-4 h-4 me-1"/> {lang === 'he' ? 'תקין' : 'Valid'}</span> :
                                            <span className="flex items-center text-red-600 dark:text-red-400"><XCircle className="w-4 h-4 me-1"/> {lang === 'he' ? 'לא תקין' : 'Invalid'}</span>}
                                        {model.lastValidated && <p className="text-xs text-slate-400 dark:text-slate-500">{lang === 'he' ? 'נבדק: ' : 'Validated: '}{new Date(model.lastValidated).toLocaleDateString()}</p>}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        I: ${model.costs?.input?.toFixed(2) ?? KNOWN_MODELS_PRICING[model.modelId]?.input?.toFixed(2) ?? 'N/A'}<br/>
                                        O: ${model.costs?.output?.toFixed(2) ?? KNOWN_MODELS_PRICING[model.modelId]?.output?.toFixed(2) ?? 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1.5 flex-wrap">
                                        <Button size="sm" variant="outline" onClick={() => handleValidateModel(model)} disabled={validatingModelId === model.id}>
                                            {validatingModelId === model.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-3 h-3 me-1"/>} {lang === 'he' ? 'בדוק' : 'Validate'}
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleSetDefault(model.id)} disabled={model.isDefault ?? false}>{lang === 'he' ? 'ברירת מחדל' : 'Set Default'}</Button>
                                        <Button size="sm" variant="outline" onClick={() => handleEditModel(model)}><Edit3 className="w-3 h-3 me-1"/>{lang === 'he' ? 'ערוך' : 'Edit'}</Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDeleteConfirm(model.id)}><Trash2 className="w-3 h-3 me-1"/>{lang === 'he' ? 'מחק' : 'Delete'}</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">{lang === 'he' ? 'לא הוגדרו מודלים. לחץ על "הוסף מודל חדש" כדי להתחיל.' : 'No models configured. Click "Add New Model" to start.'}</p>
                )}
            </CardContent>
            <Dialog open={showAddModelDialog} onOpenChange={setShowAddModelDialog} size="lg">
                <DialogHeader>
                    <DialogTitle>{editingModel?.id ? (lang === 'he' ? 'ערוך מודל API' : 'Edit API Model') : (lang === 'he' ? 'הוסף מודל API חדש' : 'Add New API Model')}</DialogTitle>
                </DialogHeader>
                <DialogContent className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <Label htmlFor="modelName">{lang === 'he' ? 'שם תצוגה למודל' : 'Model Display Name'} <span className="text-red-500">*</span></Label>
                        <Input id="modelName" value={editingModel?.name ?? ''} onChange={(e) => setEditingModel(p => ({...(p ?? getInitialEditingModel()), name: e.target.value}))} placeholder={lang === 'he' ? 'למשל, OpenAI GPT-4 שלי' : 'e.g., My OpenAI GPT-4'}/>
                    </div>
                     <div>
                        <Label htmlFor="provider">{lang === 'he' ? 'ספק API' : 'API Provider'} <span className="text-red-500">*</span></Label>
                        <Select id="provider" value={editingModel?.provider ?? ''} onChange={(e) => {
                             const selectedProvider = e.target.value;
                             const defaultModelForProvider = PROVIDER_INFO[selectedProvider]?.defaultModel || '';
                             const knownPricingForModel = KNOWN_MODELS_PRICING[defaultModelForProvider];
                             setEditingModel(p => ({
                                 ...(p ?? getInitialEditingModel()), 
                                 provider: selectedProvider,
                                 modelId: defaultModelForProvider,
                                 costs: knownPricingForModel ? {input: knownPricingForModel.input, output: knownPricingForModel.output} : {input:0, output:0},
                                 isFreeTier: knownPricingForModel?.isFreeTier ?? false,
                                 apiKey: selectedProvider === 'google' ? '' : (p?.apiKey ?? ''), 
                                 apiUrl: PROVIDER_INFO[selectedProvider]?.requiresEndpoint ? '' : undefined 
                            }));
                        }}>
                            <option value="" disabled>{lang === 'he' ? 'בחר ספק...' : 'Select provider...'}</option>
                            {Object.entries(PROVIDER_INFO).map(([key, info]) => (
                                <option key={key} value={key}>{info.name}</option>
                            ))}
                        </Select>
                        {editingModel?.provider && PROVIDER_INFO[editingModel.provider]?.note && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{PROVIDER_INFO[editingModel.provider]?.note}</p>
                        )}
                    </div>
                     {editingModel?.provider && (
                        <div>
                            <Label htmlFor="modelId">{lang === 'he' ? 'מזהה מודל (ID)' : 'Model ID'} <span className="text-red-500">*</span></Label>
                            <Select id="modelId" value={editingModel?.modelId ?? ''} onChange={(e) => {
                                const newModelId = e.target.value;
                                const knownPricing = KNOWN_MODELS_PRICING[newModelId];
                                setEditingModel(p => ({
                                    ...(p ?? getInitialEditingModel()),
                                    modelId: newModelId,
                                    costs: knownPricing ? {input: knownPricing.input, output: knownPricing.output} : {input:0, output:0},
                                    isFreeTier: knownPricing?.isFreeTier ?? false
                                }));
                            }}>
                                <option value="" disabled>{lang === 'he' ? 'בחר מזהה מודל...' : 'Select model ID...'}</option>
                                {Object.keys(KNOWN_MODELS_PRICING)
                                    .filter(mId => KNOWN_MODELS_PRICING[mId].provider === editingModel.provider)
                                    .map(mId => (
                                    <option key={mId} value={mId}>{mId} {KNOWN_MODELS_PRICING[mId].isFreeTier ? ` (${lang === 'he' ? 'חינמי' : 'Free Tier'})` : ''}</option>
                                ))}
                                <option value="custom">{lang === 'he' ? 'מותאם אישית...' : 'Custom...'}</option>
                            </Select>
                            {editingModel?.modelId === 'custom' && (
                                 <Input type="text" value={(editingModel as any)?.modelIdIfCustom || ''} onChange={(e) => setEditingModel(p => ({...(p ?? getInitialEditingModel()), modelIdIfCustom: e.target.value, modelId: e.target.value}))} placeholder={lang === 'he' ? "הזן מזהה מודל מותאם אישית" : "Enter custom model ID"} className="mt-2"/>
                            )}
                        </div>
                    )}
                    {editingModel?.provider !== 'google' && (
                        <div>
                            <Label htmlFor="apiKey">{lang === 'he' ? 'מפתח API' : 'API Key'} <span className="text-red-500">*</span></Label>
                            <Input id="apiKey" type="password" value={editingModel?.apiKey ?? ''} onChange={(e) => setEditingModel(p => ({...(p ?? getInitialEditingModel()), apiKey: e.target.value}))} placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"/>
                            {editingModel?.provider && PROVIDER_INFO[editingModel.provider]?.apiKeyUrl && (
                                <a href={PROVIDER_INFO[editingModel.provider]?.apiKeyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline flex items-center gap-1 mt-1">
                                   <ExternalLink className="w-3 h-3"/> {lang === 'he' ? 'קבל מפתח API' : 'Get API Key'}
                                </a>
                            )}
                        </div>
                    )}
                     {PROVIDER_INFO[editingModel?.provider || '']?.requiresEndpoint && (
                         <div>
                            <Label htmlFor="apiUrl">{lang === 'he' ? 'כתובת API Endpoint (נדרש עבור Azure)' : 'API Endpoint URL (Required for Azure)'}</Label>
                            <Input id="apiUrl" value={editingModel?.apiUrl ?? ''} onChange={(e) => setEditingModel(p => ({...(p ?? getInitialEditingModel()), apiUrl: e.target.value}))} placeholder="https://YOUR_RESOURCE_NAME.openai.azure.com"/>
                        </div>
                     )}
                     {!PROVIDER_INFO[editingModel?.provider || '']?.requiresEndpoint && editingModel?.provider !== 'google' && (
                        <div>
                            <Label htmlFor="apiUrl">{lang === 'he' ? 'כתובת API Endpoint (אופציונלי, רק למקרים מיוחדים)' : 'API Endpoint URL (Optional, for special cases only)'}</Label>
                            <Input id="apiUrl" value={editingModel?.apiUrl ?? ''} onChange={(e) => setEditingModel(p => ({...(p ?? getInitialEditingModel()), apiUrl: e.target.value}))} placeholder={lang === 'he' ? 'השאר ריק עבור רוב הספקים' : 'Leave blank for most providers'}/>
                        </div>
                     )}
                     {editingModel?.provider === 'google' && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md text-sm text-blue-700 dark:text-blue-300">
                            {lang === 'he' ? 'עבור Google Gemini, מפתח ה-API נטען אוטומטית מ משתנה הסביבה `API_KEY` בשרת שלך. אין צורך להזין אותו כאן.' : 'For Google Gemini, the API key is automatically loaded from the `API_KEY` environment variable on your server. No need to enter it here.'}
                        </div>
                     )}
                    <div>
                        <Label htmlFor="modelSystemPrompt">{lang === 'he' ? 'הנחיית מערכת ספציפית למודל (אופציונלי)' : 'Model-Specific System Prompt (Optional)'}</Label>
                        <Textarea id="modelSystemPrompt" value={editingModel?.modelSystemPrompt ?? ''} onChange={(e) => setEditingModel(p => ({...(p ?? getInitialEditingModel()), modelSystemPrompt: e.target.value}))} rows={3} placeholder={lang === 'he' ? 'הנחיה שתחול רק על מודל זה...' : 'Prompt that applies only to this model...'}/>
                    </div>
                     <CollapsibleCostsEditor
                        costs={editingModel?.costs}
                        onChange={(newCosts) => setEditingModel(p => ({...(p ?? getInitialEditingModel()), costs: newCosts}))}
                        modelId={editingModel?.modelId}
                        provider={editingModel?.provider}
                    />
                     <div className="flex items-center gap-2 mt-2">
                        <Switch id="isFreeTier" checked={editingModel?.isFreeTier ?? false} onCheckedChange={(checked) => setEditingModel(p => ({...(p ?? getInitialEditingModel()), isFreeTier: checked}))} />
                        <Label htmlFor="isFreeTier" className="mb-0 text-sm">{lang === 'he' ? 'סמן אם למודל זה יש שכבה חינמית משמעותית' : 'Mark if this model has a significant free tier'}</Label>
                    </div>

                </DialogContent>
                <DialogFooter>
                    <Button variant="outline" onClick={() => {setShowAddModelDialog(false); setEditingModel(null);}}>{lang === 'he' ? 'ביטול' : 'Cancel'}</Button>
                    <Button onClick={handleSaveModel} disabled={savingModel}>{savingModel ? <Loader2 className="w-4 h-4 animate-spin"/> : (lang === 'he' ? 'שמור' : 'Save')}</Button>
                </DialogFooter>
            </Dialog>
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>{lang === 'he' ? 'אישור מחיקה' : 'Confirm Deletion'}</AlertDialogTitle></AlertDialogHeader>
                    <AlertDialogDescription>{lang === 'he' ? 'האם אתה בטוח שברצונך למחוק מודל זה? לא ניתן לשחזר פעולה זו.' : 'Are you sure you want to delete this model? This action cannot be undone.'}</AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{lang === 'he' ? 'ביטול' : 'Cancel'}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteModel}>{lang === 'he' ? 'מחק' : 'Delete'}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}

function PersonasSettings() {
    const { lang } = useAppContext();
    const { personas, addPersona, updatePersona, deletePersona, reorderPersonas, activePersonaId, setActivePersonaId } = useUserSettings();
    
    const getInitialEditingPersona = (): Partial<Persona> => ({
        name: '', 
        prompt: '', 
        isDefault: personas.length === 0
    });

    const [editingPersona, setEditingPersona] = useState<Partial<Persona> | null>(null);
    const [showPersonaDialog, setShowPersonaDialog] = useState(false);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleAddNewPersona = () => {
        setEditingPersona(getInitialEditingPersona());
        setShowPersonaDialog(true);
    };
    const handleEditPersona = (persona: Persona) => {
        setEditingPersona({
            ...getInitialEditingPersona(), 
            ...persona, 
            name: persona.name ?? '',
            prompt: persona.prompt ?? '',
            isDefault: persona.isDefault ?? false
        });
        setShowPersonaDialog(true);
    };
    const handleSavePersona = async () => {
        if (!editingPersona || !editingPersona.name?.trim() || !editingPersona.prompt?.trim()) return;

        let savedPersona;
        if (editingPersona.id) {
            savedPersona = await updatePersona(editingPersona.id, editingPersona);
        } else {
            savedPersona = await addPersona(editingPersona as Omit<Persona, 'id' | 'order'>);
        }
        if (savedPersona.isDefault) setActivePersonaId(savedPersona.id);

        setShowPersonaDialog(false);
        setEditingPersona(null);
    };
    const handleDeletePersona = async (personaId: string) => {
        if (window.confirm(lang === 'he' ? 'האם למחוק פרסונה זו?' : 'Delete this persona?')) {
            await deletePersona(personaId);
        }
    };
    const handleSetDefaultPersona = async (personaId: string) => {
        await updatePersona(personaId, { isDefault: true });
        setActivePersonaId(personaId);
    };

    const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) return;
        let _personas = [...personas];
        const draggedItemContent = _personas.splice(dragItem.current, 1)[0];
        _personas.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        reorderPersonas(_personas);
    };

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <CardTitle>{lang === 'he' ? 'ניהול פרסונות' : 'Manage Personas'}</CardTitle>
                <Button onClick={handleAddNewPersona} size="sm"><Plus className="w-4 h-4 me-2"/>{lang === 'he' ? 'הוסף פרסונה' : 'Add Persona'}</Button>
            </CardHeader>
            <CardContent>
                {personas.length > 0 ? (
                    <ul className="space-y-3">
                        {personas.map((persona, index) => (
                            <li
                                key={persona.id}
                                draggable
                                onDragStart={() => dragItem.current = index}
                                onDragEnter={() => dragOverItem.current = index}
                                onDragEnd={handleDragSort}
                                onDragOver={(e) => e.preventDefault()}
                                className={`p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between group cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow
                                            ${activePersonaId === persona.id ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/40' : 'bg-slate-50 dark:bg-slate-700/30'}`}
                            >
                                <div className="flex items-center flex-1 min-w-0">
                                    <GripVertical className="w-5 h-5 text-slate-400 dark:text-slate-500 me-3 invisible group-hover:visible flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center truncate">
                                            {persona.name}
                                            {persona.isDefault && <span title={lang === 'he' ? 'פרסונת ברירת מחדל' : 'Default Persona'}><Star className="w-4 h-4 text-yellow-400 ms-2" /></span>}
                                        </h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{persona.prompt}</p>
                                    </div>
                                </div>
                                <div className="space-x-2 flex-shrink-0 ms-2">
                                    {!(persona.isDefault ?? false) && <Button size="sm" variant="outline" onClick={() => handleSetDefaultPersona(persona.id)}>{lang === 'he' ? 'ברירת מחדל' : 'Set Default'}</Button>}
                                    <Button size="sm" variant="outline" onClick={() => handleEditPersona(persona)}><Edit3 className="w-3 h-3 me-1"/>{lang === 'he' ? 'ערוך' : 'Edit'}</Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDeletePersona(persona.id)} disabled={personas.length === 1 && (persona.isDefault ?? false)}><Trash2 className="w-3 h-3 me-1"/>{lang === 'he' ? 'מחק' : 'Delete'}</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">{lang === 'he' ? 'אין פרסונות שמורות.' : 'No saved personas yet.'}</p>
                )}
            </CardContent>
            <Dialog open={showPersonaDialog} onOpenChange={setShowPersonaDialog} size="md">
                <DialogHeader>
                    <DialogTitle>{editingPersona?.id ? (lang === 'he' ? 'ערוך פרסונה' : 'Edit Persona') : (lang === 'he' ? 'הוסף פרסונה חדשה' : 'Add New Persona')}</DialogTitle>
                </DialogHeader>
                <DialogContent className="p-6 space-y-4">
                    <div>
                        <Label htmlFor="personaName">{lang === 'he' ? 'שם הפרסונה' : 'Persona Name'}</Label>
                        <Input id="personaName" value={editingPersona?.name ?? ''} onChange={(e) => setEditingPersona(p => ({...(p ?? getInitialEditingPersona()), name: e.target.value}))} />
                    </div>
                    <div>
                        <Label htmlFor="personaPrompt">{lang === 'he' ? 'הנחיית מערכת לפרסונה' : 'System Prompt for Persona'}</Label>
                        <Textarea id="personaPrompt" value={editingPersona?.prompt ?? ''} onChange={(e) => setEditingPersona(p => ({...(p ?? getInitialEditingPersona()), prompt: e.target.value}))} rows={5}/>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch id="personaIsDefault" checked={editingPersona?.isDefault ?? false} onCheckedChange={(checked) => setEditingPersona(p => ({...(p ?? getInitialEditingPersona()), isDefault: checked}))} />
                        <Label htmlFor="personaIsDefault" className="mb-0 text-sm">{lang === 'he' ? 'קבע כפרסונת ברירת מחדל' : 'Set as default persona'}</Label>
                    </div>
                </DialogContent>
                <DialogFooter>
                    <Button variant="outline" onClick={() => {setShowPersonaDialog(false); setEditingPersona(null);}}>{lang === 'he' ? 'ביטול' : 'Cancel'}</Button>
                    <Button onClick={handleSavePersona}>{lang === 'he' ? 'שמור' : 'Save'}</Button>
                </DialogFooter>
            </Dialog>
        </Card>
    );
}

interface CalendarViewProps { 
    date: Date;
    data: {[key: number]: { incomingTokens: number; outgoingTokens: number; cost: number }};
    lang: string;
}
function CalendarView({ date, data, lang }: CalendarViewProps) {
    const currentLocale = lang === 'he' ? he : enUS;
    const daysOfWeek = Array.from({ length: 7 }, (_, i) => format(new Date(2023, 0, i + (currentLocale.options?.weekStartsOn || 0)), 'eee', { locale: currentLocale }));

    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    let startingDayIndex = getDay(startDate) - (currentLocale.options?.weekStartsOn || 0);
    if (startingDayIndex < 0) startingDayIndex += 7;

    return (
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {daysOfWeek.map(day => <div key={day} className="text-center font-medium text-xs text-slate-500 dark:text-slate-400 py-2">{day}</div>)}
            {Array.from({ length: startingDayIndex }).map((_, i) => <div key={`empty-${i}`} className="border border-slate-100 dark:border-slate-700/50 rounded-lg min-h-[100px] sm:min-h-[120px]"></div>)}
            {daysInMonth.map((dayInstance) => {
                const dayNumber = dayInstance.getDate();
                const dayData = data[dayNumber];
                return (
                    <div key={dayInstance.toString()} className="border border-slate-200 dark:border-slate-700 rounded-lg min-h-[100px] sm:min-h-[120px] p-2 sm:p-2.5 flex flex-col bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{dayNumber}</span>
                        {dayData && (
                            <div className="text-xs mt-1 space-y-1 flex-grow flex flex-col justify-end">
                                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400" title={lang === 'he' ? 'טוקנים נכנסים' : 'Incoming Tokens'}>
                                    <TrendingDown className="w-3.5 h-3.5 flex-shrink-0"/>
                                    <span className="truncate">{dayData.incomingTokens.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-1 text-green-600 dark:text-green-400" title={lang === 'he' ? 'טוקנים יוצאים' : 'Outgoing Tokens'}>
                                    <TrendingUp className="w-3.5 h-3.5 flex-shrink-0"/> 
                                    <span className="truncate">{dayData.outgoingTokens.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400" title={lang === 'he' ? 'עלות' : 'Cost'}>
                                    <DollarSign className="w-3.5 h-3.5 flex-shrink-0"/> <span className="truncate">${dayData.cost.toFixed(3)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function UsageDashboard() {
    const { lang, tokenUsage } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const currentLocale = lang === 'he' ? he : enUS;

    const filteredData = tokenUsage.filter(d => {
        try {
            const recordDate = parseISO(d.date); 
            return isSameMonth(recordDate, currentDate);
        } catch (e) {
            console.warn("Invalid date in tokenUsage:", d.date);
            return false;
        }
    });

    const dataByDay = filteredData.reduce((acc: {[key: number]: { incomingTokens: number; outgoingTokens: number; cost: number }}, curr) => {
        try {
            const day = parseISO(curr.date).getDate();
            if (!acc[day]) acc[day] = { incomingTokens: 0, outgoingTokens: 0, cost: 0 };
            acc[day].incomingTokens += curr.incomingTokens;
            acc[day].outgoingTokens += curr.outgoingTokens;
            acc[day].cost += curr.cost;
        } catch (e) {
            console.warn("Could not process date for day aggregation:", curr.date);
        }
        return acc;
    }, {});

    const monthlyTotal = filteredData.reduce((acc, curr) => {
        acc.incomingTokens += curr.incomingTokens;
        acc.outgoingTokens += curr.outgoingTokens;
        acc.cost += curr.cost;
        return acc;
    }, { incomingTokens: 0, outgoingTokens: 0, cost: 0 });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{lang === 'he' ? 'מעקב שימוש ועלויות' : 'Usage & Cost Tracking'}</CardTitle>
                <CardDescription>{lang === 'he' ? 'צפה בשימוש ועלויות לפי יום, ספק ומודל.' : 'View usage and costs by day, provider, and model.'}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="rounded-full"><ChevronLeft/></Button>
                        <h3 className="text-xl font-semibold w-48 text-center text-slate-700 dark:text-slate-200">{format(currentDate, 'MMMM yyyy', { locale: currentLocale })}</h3>
                        <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="rounded-full"><ChevronRight/></Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-center">
                    <Card className="bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700">
                        <CardHeader className="pb-2 pt-4"><CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">{lang === 'he' ? 'סה"כ טוקנים נכנסים (חודשי)' : 'Total Incoming Tokens (Monthly)'}</CardTitle></CardHeader>
                        <CardContent className="pb-4"><p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{monthlyTotal.incomingTokens.toLocaleString()}</p></CardContent>
                    </Card>
                     <Card className="bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-700">
                        <CardHeader className="pb-2 pt-4"><CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">{lang === 'he' ? 'סה"כ טוקנים יוצאים (חודשי)' : 'Total Outgoing Tokens (Monthly)'}</CardTitle></CardHeader>
                        <CardContent className="pb-4"><p className="text-3xl font-bold text-green-600 dark:text-green-400">{monthlyTotal.outgoingTokens.toLocaleString()}</p></CardContent>
                    </Card>
                     <Card className="bg-purple-50 dark:bg-purple-900/40 border-purple-200 dark:border-purple-700">
                        <CardHeader className="pb-2 pt-4"><CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">{lang === 'he' ? 'סה"כ עלות (חודשי)' : 'Total Cost (Monthly)'}</CardTitle></CardHeader>
                        <CardContent className="pb-4"><p className="text-3xl font-bold text-purple-600 dark:text-purple-400">${monthlyTotal.cost.toFixed(2)}</p></CardContent>
                    </Card>
                </div>
                <CalendarView date={currentDate} data={dataByDay} lang={lang} />
            </CardContent>
        </Card>
    );
}


export function SettingsPage() {
    const { lang } = useAppContext();
    return (
        // PageWrapper for settings might not need disablePadding, so remove it or set to false
        // The overall padding for settings is handled by the container in SettingsLayout
        <SettingsLayout> 
            {({ activeSettingsTab }) => {
                switch (activeSettingsTab) {
                    case 'profile': return <><ProfileSettings /><div className="my-8 border-t border-slate-200 dark:border-slate-700"></div><SavedPromptsSettings /></>;
                    case 'appearance': return <AppearanceSettings />;
                    case 'api': return <ApiSettingsSection />;
                    case 'personas': return <PersonasSettings />;
                    case 'usage': return <UsageDashboard />;
                    default: return <div className="p-6 text-center text-slate-500">{lang === 'he' ? 'בחר קטגוריה מהתפריט' : 'Select a category from the menu'}</div>;
                }
            }}
        </SettingsLayout>
    );
}
