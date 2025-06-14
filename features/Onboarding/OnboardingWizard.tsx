
import React, { useState } from "react";
import { Cpu, Loader2, ExternalLink, Play } from "lucide-react";
import { useAppContext, ApiSetting, KNOWN_MODELS_PRICING, PROVIDER_INFO } from '../../contexts/AppContext';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '../../components/ui/Dialog';

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
    const { lang, loadApiSettings, openErrorDialog, ApiSettingsStorage, validateApiKey } = useAppContext();
    const [step, setStep] = useState(0); 
    const [selectedProviderKey, setSelectedProviderKey] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState('');
    const [apiUrl, setApiUrl] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [validationError, setValidationError] = useState<string | null>(null);

    const providerList = Object.entries(PROVIDER_INFO).filter(([key, _info]) => ['openai', 'google', 'anthropic', 'microsoft', 'perplexity'].includes(key));

    const handleProviderSelect = (providerKey: string) => {
        setSelectedProviderKey(providerKey);
        setApiKey(''); // Reset API key field
        setApiUrl(PROVIDER_INFO[providerKey]?.requiresEndpoint ? '' : ''); // Reset API URL if required
        setStep(2);
    };

    const handleValidateAndSave = async () => {
        if (!selectedProviderKey ||
            (selectedProviderKey !== 'google' && !apiKey.trim()) ||
            (PROVIDER_INFO[selectedProviderKey]?.requiresEndpoint && !apiUrl.trim())
        ) {
             openErrorDialog(
                lang === 'he' ? 'קלט חסר' : 'Missing Input',
                lang === 'he' ?
                    `אנא הזן את כל השדות הנדרשים עבור ${PROVIDER_INFO[selectedProviderKey || '']?.name || 'הספק הנבחר'}.` :
                    `Please enter all required fields for ${PROVIDER_INFO[selectedProviderKey || '']?.name || 'the selected provider'}.`
            );
            return;
        }
        setIsValidating(true);
        setValidationStatus('idle');
        setValidationError(null);

        const providerInfo = PROVIDER_INFO[selectedProviderKey];
        const modelConfig: ApiSetting = {
            id: `onboarding-${selectedProviderKey}-${Date.now()}`,
            name: `${providerInfo.name} (Onboarding)`,
            provider: selectedProviderKey,
            modelId: providerInfo.defaultModel,
            apiKey: selectedProviderKey === 'google' ? '' : apiKey, // API Key not stored for Google
            apiUrl: apiUrl || undefined,
            costs: KNOWN_MODELS_PRICING[providerInfo.defaultModel] || { input: 0, output: 0 },
            isFreeTier: KNOWN_MODELS_PRICING[providerInfo.defaultModel]?.isFreeTier || false,
            isDefault: true, 
            isValid: false, 
        };

        const validation = await validateApiKey(modelConfig); // For Google, this uses process.env.API_KEY
        if (validation.isValid) {
            await ApiSettingsStorage.upsert({ ...modelConfig, isValid: true, lastValidated: new Date().toISOString() });
            setValidationStatus('success');
            setTimeout(async () => {
                await loadApiSettings();
                onComplete();
            }, 1500);
        } else {
            setValidationStatus('error');
            setValidationError(validation.error || (lang === 'he' ? 'האימות נכשל. בדוק את המפתח והחיבור.' : 'Validation failed. Check key and connection.'));
        }
        setIsValidating(false);
    };

    const translations = {
        welcomeTitle: { he: "ברוכים הבאים ל-LUMINA!", en: "Welcome to LUMINA!" },
        welcomeDesc: { he: "בוא נגדיר את חיבור ה-API הראשון שלך כדי להתחיל.", en: "Let's set up your first API connection to get started." },
        next: { he: "הבא", en: "Next" },
        selectProviderTitle: { he: "בחר ספק API", en: "Select API Provider" },
        selectProviderDesc: { he: "בחר את ספק ה-AI איתו תרצה להשתמש. תוכל להוסיף עוד מאוחר יותר.", en: "Choose the AI provider you want to use. You can add more later." },
        apiKeyTitle: { he: "הגדר חיבור API", en: "Configure API Connection" },
        apiKeyDesc: { he: (providerKey: string | null) => `הזן את הפרטים הנדרשים עבור ${providerKey ? PROVIDER_INFO[providerKey]?.name : ''}.`, en: (providerKey: string | null) => `Enter the required details for ${providerKey ? PROVIDER_INFO[providerKey]?.name : ''}.`},
        apiKeyLabel: { he: "מפתח API", en: "API Key"},
        apiEndpointLabel: { he: "כתובת API Endpoint", en: "API Endpoint URL"},
        validateAndSave: { he: "בדוק ושמור", en: "Validate & Save" },
        validating: { he: "מאמת...", en: "Validating..." },
        validationSuccess: { he: "האימות הצליח! מעביר אותך לאפליקציה...", en: "Validation successful! Taking you to the app..." },
        validationErrorMsg: { he: "שגיאת אימות:", en: "Validation Error:" },
        videoGuide: { he: "מדריך וידאו לקבלת מפתח", en: "Video Guide for API Key"},
        googleProviderNote: { he: "עבור Google Gemini, מפתח ה-API נטען אוטומטית מ משתנה סביבה בשרת שלך. אין צורך להזין אותו כאן.", en: "For Google Gemini, the API key is automatically loaded from an environment variable on your server. No need to enter it here."},
        back: { he: "חזור", en: "Back"},
        skipOnboarding: {he: "דלג על ההגדרה הראשונית (הגדרות מתקדמות)", en: "Skip Initial Setup (Advanced Settings)"},
    };

    const currentLang = lang as 'he' | 'en';

    const renderStepContent = () => {
        switch (step) {
            case 0: 
                return (
                    <DialogContent className="text-center p-8">
                        <Cpu className="w-16 h-16 mx-auto text-indigo-500 mb-4" />
                        <DialogTitle>{translations.welcomeTitle[currentLang]}</DialogTitle>
                        <DialogDescription>{translations.welcomeDesc[currentLang]}</DialogDescription>
                    </DialogContent>
                );
            case 1: 
                return (
                    <DialogContent className="p-6">
                        <DialogTitle>{translations.selectProviderTitle[currentLang]}</DialogTitle>
                        <DialogDescription>{translations.selectProviderDesc[currentLang]}</DialogDescription>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                            {providerList.map(([key, info]) => (
                                <Card key={key} onClick={() => handleProviderSelect(key)} className="cursor-pointer hover:shadow-lg transition-shadow">
                                    <CardHeader className="flex items-center gap-3">
                                        <CardTitle className="text-lg">{info.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{lang === 'he' ? `מודל ברירת מחדל: ${info.defaultModel}` : `Default model: ${info.defaultModel}`}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </DialogContent>
                );
            case 2: 
                const currentProviderInfo = selectedProviderKey ? PROVIDER_INFO[selectedProviderKey] : null;
                return (
                    <DialogContent className="p-6 space-y-4">
                        <DialogTitle>{translations.apiKeyTitle[currentLang]}</DialogTitle>
                        <DialogDescription>{translations.apiKeyDesc[currentLang](selectedProviderKey)}</DialogDescription>
                        
                        {selectedProviderKey !== 'google' && (
                            <div>
                                <Label htmlFor="onboardingApiKey">{translations.apiKeyLabel[currentLang]}</Label>
                                <Input id="onboardingApiKey" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-xxxxxxxxxx" />
                            </div>
                        )}

                        {currentProviderInfo?.requiresEndpoint && (
                            <div>
                                <Label htmlFor="onboardingApiUrl">{translations.apiEndpointLabel[currentLang]}</Label>
                                <Input id="onboardingApiUrl" value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="https://YOUR_RESOURCE.openai.azure.com"/>
                            </div>
                        )}
                        
                        {selectedProviderKey === 'google' && (
                             <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md text-sm text-blue-700 dark:text-blue-300">
                                {translations.googleProviderNote[currentLang]}
                            </div>
                        )}

                        {currentProviderInfo?.apiKeyUrl && selectedProviderKey !== 'google' && (
                             <a href={currentProviderInfo.apiKeyUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                                <ExternalLink className="w-3 h-3"/> {lang === 'he' ? `איך מקבלים מפתח ${currentProviderInfo.name}?` : `How to get a ${currentProviderInfo.name} key?`}
                            </a>
                        )}
                        {currentProviderInfo?.videoUrl && selectedProviderKey !== 'google' && ( // Also hide video guide if API key is not asked
                            <a href={currentProviderInfo.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                                <Play className="w-3 h-3"/> {translations.videoGuide[currentLang]}
                            </a>
                        )}
                        {validationStatus === 'error' && <p className="text-red-500 text-sm">{translations.validationErrorMsg[currentLang]} {validationError}</p>}
                    </DialogContent>
                );
            default: return null;
        }
    };

    const footerActions = () => {
         switch (step) {
            case 0:
                return <Button onClick={() => setStep(1)}>{translations.next[currentLang]}</Button>;
            case 1:
                 return (
                    <>
                        <Button variant="outline" onClick={() => setStep(0)}>{translations.back[currentLang]}</Button>
                        <Button variant="ghost" size="sm" onClick={onComplete} className="text-xs absolute bottom-4 left-4">{translations.skipOnboarding[currentLang]}</Button>
                    </>
                 );
            case 2:
                return (
                    <>
                        <Button variant="outline" onClick={() => setStep(1)} disabled={isValidating}>{translations.back[currentLang]}</Button>
                        <Button onClick={handleValidateAndSave} disabled={isValidating || validationStatus === 'success'}>
                            {isValidating ? <Loader2 className="w-4 h-4 animate-spin me-2"/> : null}
                            {validationStatus === 'success' ? translations.validationSuccess[currentLang] :
                             isValidating ? translations.validating[currentLang] : translations.validateAndSave[currentLang]}
                        </Button>
                    </>
                );
            default: return null;
        }
    }

    return (
        <Dialog open={true} onOpenChange={() => {}} size="lg">
            <DialogHeader className="p-0">{null}</DialogHeader>
            {renderStepContent()}
            <DialogFooter className="border-t border-gray-200 dark:border-gray-700">
                {footerActions()}
            </DialogFooter>
        </Dialog>
    );
}
